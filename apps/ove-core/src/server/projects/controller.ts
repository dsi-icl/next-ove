/* global __dirname */

import path from "path";
import fetch from "node-fetch";
import { env } from "../../env";
import { nanoid } from "nanoid";
import unzip from "unzip-stream";
import type { Client } from "minio";
import service from "../auth/service";
import { readFileSync } from "atomically";
import { S3Controller } from "./s3-controller";
import { type DataTypes, isError } from "@ove/ove-types";
import type { Controller, DataFormatConfigOptions } from "./router";
import type { PrismaClient, Project, Section } from "@prisma/client";
import { assert, Json, raise, titleToBucketName } from "@ove/ove-utils";

import "@total-typescript/ts-reset";
import http from "http";

const getProjectsForUser = async (prisma: PrismaClient, username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });

  return prisma.project.findMany({
    where: {
      OR: [
        {
          collaboratorIds: {
            hasSome: [assert(user).id]
          }
        },
        {
          creatorId: assert(user).id
        },
        {
          isPublic: true
        }
      ]
    }
  });
};

const getProject = async (
  prisma: PrismaClient,
  username: string,
  id: string
) => {
  if (id.length === 32) return null;
  const user = await prisma.user.findUnique({ where: { username } });

  return prisma.project.findUnique({
    where: {
      id,
      OR: [{
        collaboratorIds: {
          hasSome: [assert(user).id]
        }
      }, {
        creatorId: assert(user).id
      }, { isPublic: true }]
    }
  });
};

const getTagsForUser = async (prisma: PrismaClient, username: string) => {
  const projects = await getProjectsForUser(prisma, username);
  return projects.flatMap(({ tags }) => tags);
};

const getUsers = async (prisma: PrismaClient) => prisma.user.findMany();

const getInvitesForProject = async (
  prisma: PrismaClient, projectId: string) => {
  if (projectId.length === 32) return [];
  return prisma.invite.findMany({
    where: {
      projectId
    }
  });
};

const createProject = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  project: Pick<Project, "title"> | undefined,
  layout: Omit<Section, "id" | "projectId">[] | undefined,
  files: string[] | undefined
) => {
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });
  if (user === null) {
    return raise("User cannot be null");
  }

  const title = project?.title ?? nanoid(16);
  let files_: string[] | undefined = undefined;

  const project_ = await prisma.project.create({
    data: {
      title,
      creatorId: user.id
    }
  });

  if (s3 !== null) {
    await S3Controller.createBucket(s3, titleToBucketName(title));

    if (files === undefined || !files.includes("env.json")) {
      await S3Controller.uploadFile(s3,
        titleToBucketName(title), "env.json", Json.EMPTY);
    }
    if (files === undefined || !files.includes("control.html")) {
      const template = readFileSync(
        path.join(__dirname, "assets", "control-template.html")).toString();
      await S3Controller
        .uploadFile(s3, titleToBucketName(title), "control.html", template);
    }

    if (files !== undefined) {
      files_ = await Promise.all(files.map(file => S3Controller
        .getPresignedPutURL(s3, titleToBucketName(title), file)));
    }
  }

  const layout_ = await Promise.all(
    (layout ?? []).map(section => prisma.section.create({
      data: {
        width: section.width,
        height: section.height,
        x: section.x,
        y: section.y,
        asset: section.asset,
        assetId: section.assetId,
        dataType: section.dataType,
        states: section.states,
        ordering: section.ordering,
        projectId: project_.id
      }
    })));

  return { project: project_, layout: layout_, files: files_ };
};

const saveProject = async (
  prisma: PrismaClient,
  username: string,
  project: Project,
  layout: Section[]
) => {
  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (project.creatorId !== user?.id &&
    !project.collaboratorIds.includes(user?.id ?? "ERROR")) {
    throw new Error("Cannot make changes to public project");
  }

  const { id, ...data } = project;
  const existing = await prisma.project.findUniqueOrThrow({
    where: {
      id
    }
  });

  // TODO: replace with either bucket re-instantiation or lookup mechanism
  if (existing.title !== data.title) {
    throw new Error("Cannot change project title");
  }

  const sectionIds = (await prisma.section.findMany()).map(({ id }) => id);
  const newSectionIds = layout.map(({ id }) => id).filter(Boolean);
  for (const sectionId of sectionIds) {
    if (newSectionIds.includes(sectionId)) continue;
    await prisma.section.delete({
      where: {
        id: sectionId
      }
    });
  }

  const layout_ = await Promise.all(
    layout.map(async section => {
      if (section.id.length === 32) {
        // eslint-disable-next-line no-unused-vars
        const { id: _id, ...data } = section;
        return prisma.section.create({ data });
      } else {
        // eslint-disable-next-line no-unused-vars
        const { id, projectId: _projectId, ...data } = section;
        return prisma.section.update({ data, where: { id } });
      }
    }));

  const project_ = await prisma.project.update({
    data,
    where: {
      id
    }
  });

  return { project: project_, layout: layout_ };
};

const groupBy = <T extends object>(xs: T[], key: keyof T) =>
  xs.reduce((rv, x) => {
    // @ts-expect-error - object keys
    (rv[x[key]] = rv[x[key]] || []).push(x);
    return rv;
  }, {} as { [_Key in keyof T]: T[] });

const addLatest = <T extends {
  versionId: string,
  isLatest: boolean,
  lastModified: Date
}>(files: T[]): T[] =>
  files.concat(files.filter(({ isLatest }) => isLatest).map(file => ({
    ...file,
    versionId: "latest",
    lastModified: new Date(),
    isLatest: false
  })));

const getProjectFiles = async (s3: Client, bucketName: string) => {
  const files = await S3Controller.listObjects(s3, bucketName);
  return Object.values(groupBy(files, "name"))
    .map(group => group.sort((a, b) =>
      a.lastModified.getTime() - b.lastModified.getTime())
      .map((file, i) => ({
        ...file,
        versionId: `v${i}`
      }))).flat();
};

const getGlobalFiles = async (s3: Client): ReturnType<Controller["getFiles"]> =>
  (await Promise.all(env.ASSET_STORE_CONFIG?.GLOBAL_BUCKETS
    .map(async bucket => {
      const objects = await S3Controller.listObjects(s3, bucket);
      return Object.values(groupBy(objects, "name"))
        .map(group => group.sort((a, b) =>
          a.lastModified.getTime() - b.lastModified.getTime())
          .map((obj, i) => ({
            ...obj,
            versionId: `v${i}`,
            bucketName: bucket
          }))).flat();
    }) ?? [])).flat().map(object => ({
    name: assert(object.name),
    version: object.versionId,
    isGlobal: true,
    isLatest: object.isLatest,
    bucketName: object.bucketName
  }));

const getFiles = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  projectId: string
) => {
  const project = await getProject(prisma, username, projectId);
  if (s3 === null || project === null) return [];
  const globals = await getGlobalFiles(s3);
  const projectFiles = addLatest(await getProjectFiles(s3,
    titleToBucketName(project.title))).map(object => ({
    name: assert(object.name),
    version: object.versionId,
    isGlobal: false,
    isLatest: object.isLatest,
    bucketName: titleToBucketName(project.title)
  })).filter(({ name }) => !name.includes("OVE_FORMAT"));
  return globals.concat(projectFiles);
};

const getSectionsForProject = async (prisma: PrismaClient,
  projectId: string) => {
  if (projectId.length === 32) return [];
  return prisma.section.findMany({
    where: {
      projectId
    }
  });
};

const getS3Version = async (
  s3: Client,
  bucketName: string,
  objectName: string,
  versionId: string
) => {
  const files = (await Promise.all(assert(env.ASSET_STORE_CONFIG)
    .GLOBAL_BUCKETS.concat([bucketName]).flatMap(bucket =>
      S3Controller.listObjects(s3, bucket)))).flat().filter(file =>
    file.name === objectName).sort((a, b) =>
    a.lastModified.getTime() - b.lastModified.getTime());
  const idx = versionId === "latest" ? -1 :
    parseInt(versionId.substring(1)) - 1;
  return assert(files.at(idx)).versionId;
};

const getPresignedGetURL = async (
  s3: Client | null,
  bucketName: string,
  objectName: string,
  versionId: string
) => {
  if (s3 === null) return raise("No S3 store configured");
  return S3Controller.getPresignedGetURL(
    s3, bucketName, objectName,
    await getS3Version(s3, bucketName, objectName, versionId));
};

const getPresignedPutURL = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  projectId: string,
  objectName: string
) => {
  const project = await getProject(prisma, username, projectId);
  if (project === null) return raise(`No project with id ${projectId}`);
  if (s3 === null) return raise("No S3 store configured");
  return S3Controller.getPresignedPutURL(s3,
    titleToBucketName(project.title), objectName);
};

const generateThumbnail = async (prisma: PrismaClient, projectId: string) => {
  if (env.THUMBNAIL_GENERATOR === undefined) {
    return raise("Thumbnail generator not configured");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (project === null) return raise("Project not found");
  if (project.thumbnail !== null) return raise("Thumbnail already exists");
  const prompt = encodeURI(project.tags.join(" "));
  const thumbnail = await (await fetch(
    `${env.THUMBNAIL_GENERATOR}/generate?prompt=${prompt}`)).text();
  await prisma.project.update({
    data: {
      thumbnail
    },
    where: {
      id: projectId
    }
  });
  return thumbnail;
};

const inviteCollaborator = async (
  prisma: PrismaClient,
  projectId: string,
  senderId: string,
  recipientId: string
) => {
  await prisma.invite.create({
    data: {
      projectId,
      senderId,
      recipientId
    }
  });
};

const removeCollaborator = async (
  prisma: PrismaClient,
  projectId: string,
  recipientId: string
) => {
  await prisma.invite.deleteMany({
    where: {
      recipientId,
      projectId
    }
  });
};

const getLayout = (prisma: PrismaClient, projectId: string) => {
  return prisma.section.findMany({ where: { projectId } });
};

const getEnv = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  projectId: string
) => {
  if (s3 === null) return raise("No S3 store configured");
  const project = await getProject(prisma, username, projectId);
  if (project === null) return raise(`No project with id ${projectId}`);
  const url = await getPresignedGetURL(s3,
    titleToBucketName(project.title), "env.json", "latest");
  if (isError(url)) return url;
  const data = await (await fetch(url)).json();
  return Object.fromEntries(Object.entries(data)
    .filter(([k, _v]) => k.startsWith("OVE_PUBLIC_"))
    .map(([k, v]) => [k.substring(11), v]));
};

const getController = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  projectId: string,
  observatory: string,
  layout?: Section[]
) => {
  if (s3 === null) return raise("No S3 store configured");
  const project = await getProject(prisma, username, projectId);
  let data: string;
  if (project === null) {
    data = readFileSync(
      path.join(__dirname, "assets", "control-template.html")).toString();
  } else {
    const url = await getPresignedGetURL(s3,
      titleToBucketName(project.title), "control.html", "latest");
    if (isError(url)) return url;
    data = await (await fetch(url)).text();
  }

  if (env.CONTROLLER_FORMAT === undefined) {
    return raise("Unable to format controller");
  }

  for (const [k, v] of Object.entries(env.CONTROLLER_FORMAT)) {
    if (typeof v === "string") {
      data = data.replaceAll(`{{${k}}}`, v);
    } else {
      data = data.replaceAll(`${k}: {}`, `${k}: ${Json.stringify(v)}`);
    }
  }

  data = data.replaceAll("{{OBSERVATORY}}", observatory)
    .replaceAll("{{PROJECT_ID}}", projectId)
    .replaceAll("{{SPACE}}", observatory);

  const user = await prisma.user.findUnique({
    where: {
      username
    }
  });

  if (user === null) throw new Error("Missing user");

  const token = await prisma.refreshToken.findUnique({
    where: {
      userId: user.id
    }
  });

  let dataToken = token?.token;

  if (token === null) {
    const refreshToken = service.generateToken(username,
      env.TOKENS.REFRESH.SECRET, env.TOKENS.REFRESH.ISSUER,
      undefined, env.TOKENS.REFRESH.ISSUER);
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id
      }
    });
    dataToken = refreshToken;
  }

  data = data.replaceAll("{{TOKEN}}", assert(dataToken));

  if (layout !== undefined) {
    data = data.replaceAll(/project = await [^;]+/g,
      "project = {title: \"Temp - Dev\"}");
    data = data.replaceAll(/projectEnv = [^;]+/g, "projectEnv = {}");
    data = data.replaceAll(/project\.layouts = [^;]+/g,
      `project.layouts = ${Json.stringify(layout, undefined, 2)}`);
  }

  return data;
};

const formatDataTable = (
  title: string,
  data: string,
  opts: DataFormatConfigOptions
) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "table-format.html")).toString();
  if (!("tableSource" in opts)) {
    throw new Error("Missing options for data table formatting");
  }
  if (opts.tableSource === "csv" || opts.tableSource === "tsv") {
    template = template.replaceAll("const data = null;",
      `const data = ${JSON.stringify(data.split("\n")
        .map(x => x.split(opts.tableSource === "csv" ? "," : "\t")))};`);
    template = template.replaceAll("const containsHeader = true;",
      `const containsHeader = ${opts.containsHeader ?? false};`);
  } else {
    template = template.replaceAll("%%DATA%%", data);
  }

  template = template.replaceAll("%%TITLE%%", title);

  return template;
};

const formatJSON = (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "json-format.html")).toString();
  template = template.replaceAll("%%TITLE%%", title);
  return template.replaceAll("%%DATA%%", data);
};

const formatGeoJSON = (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "geojson-format.json")).toString();
  template = template.replaceAll("%%TITLE%%", title);
  const idx = data.indexOf(",");
  const basemap = data.substring(0, idx);
  template = template.replaceAll("%%BASEMAP%%", basemap);
  return template.replaceAll("\"%%DATA%%\"", data.substring(idx));
};

const formatHTML = (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "html-format.html")).toString();
  template = template.replaceAll("%%TITLE%%", title);
  return template.replaceAll("%%DATA%%", data);
};

const formatLatex = async (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "latex-format.html")).toString();
  template = template.replaceAll("%%TITLE%%", title);
  if (env.DATA_FORMATTER !== undefined) {
    data = await (await fetch(`${env.DATA_FORMATTER}/latex`, {
      headers: { "Content-Type": "text/plain" },
      method: "POST",
      body: data
    })).text();
  }
  return template.replaceAll("%%DATA%%", data);
};

const formatMarkdown = async (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "markdown-format.html")).toString();
  template = template.replaceAll("%%TITLE%%", title);
  if (env.DATA_FORMATTER !== undefined) {
    data = await (await fetch(`${env.DATA_FORMATTER}/markdown`, {
      headers: { "Content-Type": "text/plain" },
      method: "POST",
      body: data
    })).text();
  }
  return template.replaceAll("%%DATA%%", data);
};

const formatData = async (
  title: string,
  dataType: DataTypes,
  data: string,
  opts?: DataFormatConfigOptions
) => {
  const fileParts = title.split(".");
  const fileName = `${fileParts.slice(0, -1).join(".")}_OVE_FORMAT`;
  switch (dataType) {
    case "data-table": {
      if (opts === undefined) {
        throw new Error("Missing options for data table formatting");
      }
      const table = formatDataTable(title, data, opts);
      return { data: table, fileName: `${title}_OVE_FORMAT.html` };
    }
    case "json":
      return { data: formatJSON(title, data), fileName: `${fileName}.html` };
    case "geojson":
      return { data: formatGeoJSON(title, data), fileName: `${fileName}.json` };
    case "html":
      return { data: formatHTML(title, data), fileName: `${fileName}.html` };
    case "latex":
      return {
        data: await formatLatex(title, data),
        fileName: `${fileName}.html`
      };
    case "markdown":
      return {
        data: await formatMarkdown(title, data),
        fileName: `${fileName}.html`
      };
    default:
      return { data, fileName: `${fileName}.${fileParts.at(-1)}` };
  }
};

const formatDZI = async (
  s3: Client | null,
  bucketName: string,
  objectName: string,
  versionId: string
) => {
  if (s3 === null) return raise("No S3 store configured");
  const url = await getPresignedGetURL(s3, bucketName, objectName, versionId);
  if (isError(url)) return url;
  if (env.DATA_FORMATTER === undefined) return raise("No data formatter configured");
  const data = Json.stringify({
    "get_url": url
  });
  const formatter = new URL(env.DATA_FORMATTER);

  const options = {
    host: formatter.host,
    port: formatter.port,
    path: formatter.pathname,
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data)
    }
  };

  const req = http.request(options, res => {
    res.pipe(unzip.Parse())
      .on("entry", async entry => {
        const dziObjectName = `${objectName.replaceAll(/png|jpg$/, "dzi")}/${entry.path}`;
        const entryURL = await S3Controller.getPresignedPutURL(s3, bucketName, dziObjectName);
        await fetch(entryURL, {method: "PUT", body: entry});
      });
  });

  req.write(data);
  req.end();
};

const controller: Controller = {
  getProjectsForUser,
  getProject,
  getTagsForUser,
  getUsers,
  getInvitesForProject,
  createProject,
  saveProject,
  getFiles,
  getSectionsForProject,
  getPresignedGetURL,
  getPresignedPutURL,
  generateThumbnail,
  inviteCollaborator,
  removeCollaborator,
  getLayout,
  getEnv,
  getController,
  formatData,
  formatDZI
};

export default controller;
