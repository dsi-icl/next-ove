import { env } from "../../env";
import { type Controller } from "./router";
import { type PrismaClient, type Project, type Section } from "@prisma/client";
import { assert, Json, raise } from "@ove/ove-utils";
import "@total-typescript/ts-reset";
import { S3Controller } from "./s3-controller";
import { type Client } from "minio";
import { nanoid } from "nanoid";
import fetch from "node-fetch";
import { isError } from "@ove/ove-types";

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
      }]
    }
  });
};

const getTagsForUser = async (prisma: PrismaClient, username: string) => {
  const projects = await getProjectsForUser(prisma, username);
  return projects.flatMap(({ tags }) => tags);
};

const getUsers = async (prisma: PrismaClient) => prisma.user.findMany();

const getInvitesForProject = async (prisma: PrismaClient, projectId: string) =>
  prisma.invite.findMany({
    where: {
      projectId
    }
  });

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
    await S3Controller.createBucket(s3, project_.id);

    if (files === undefined || !files.includes(".env")) {
      await S3Controller.uploadFile(s3, project_.id, ".env", Json.EMPTY);
    }
    if (files === undefined || !files.includes("control.html")) {
      // TODO: replace with HTML Controller template
      await S3Controller
        .uploadFile(s3, project_.id, "control.html", "");
    }

    if (files !== undefined) {
      files_ = await Promise.all(files.map(file => S3Controller
        .getPresignedPutURL(s3, project_.id, file)));
    }
  }

  const layout_ = await Promise.all(
    (layout ?? []).map(section => prisma.section.create({
      data: {
        width: section.width,
        height: section.height,
        x: section.x,
        y: section.y,
        config: section.config,
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
  project: Project,
  layout: Section[]
) => {
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

  const { id, ...data } = project;

  const project_ = await prisma.project.update({
    data,
    where: {
      id
    }
  });

  return { project: project_, layout: layout_ };
};

const getGlobalFiles = async (s3: Client): ReturnType<Controller["getFiles"]> =>
  (await Promise.all(env.ASSET_STORE_CONFIG?.GLOBAL_BUCKETS
    .map(bucket => S3Controller
      .listObjects(s3, bucket)) ?? [])).flat()
    .map(object => ({
      name: assert(object.name),
      version: object.versionId,
      isGlobal: true
    }));

const getFiles = async (s3: Client | null, projectId: string) => {
  if (s3 === null) return [];
  const globals = await getGlobalFiles(s3);
  const projectFiles = (await S3Controller
    .listObjects(s3, projectId)).map(object => ({
    name: assert(object.name),
    version: object.versionId,
    isGlobal: false
  }));
  return globals.concat(projectFiles);
};

const getSectionsForProject = async (prisma: PrismaClient, projectId: string) =>
  prisma.section.findMany({
    where: {
      projectId
    }
  });

const uploadFile = async (
  s3: Client | null,
  projectId: string,
  objectName: string,
  data: string
) => {
  if (s3 === null) return raise("No S3 store configured");
  await S3Controller.uploadFile(s3, projectId, objectName, data);
};

const getPresignedGetURL = async (
  s3: Client | null,
  projectId: string,
  objectName: string,
  versionId: string
) => {
  if (s3 === null) return raise("No S3 store configured");
  return S3Controller.getPresignedGetURL(
    s3, projectId, objectName,
    versionId === "latest" ? undefined : versionId);
};

const getPresignedPutURL = async (
  s3: Client | null,
  projectId: string,
  objectName: string
) => {
  if (s3 === null) return raise("No S3 store configured");
  return S3Controller.getPresignedPutURL(s3, projectId, objectName);
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

const getEnv = async (s3: Client | null, projectId: string) => {
  if (s3 === null) return raise("No S3 store configured");
  const url = await getPresignedGetURL(s3, projectId, "env.json", "latest");
  if (isError(url)) return url;
  const data = await (await fetch(url)).json();
  return Object.fromEntries(Object.entries(data)
    .filter(([k, _v]) => k.startsWith("OVE_PUBLIC_"))
    .map(([k, v]) => [k.substring(11), v]));
};

const getController = async (
  s3: Client | null,
  projectId: string,
  observatory: string
) => {
  if (s3 === null) return raise("No S3 store configured");
  const url = await getPresignedGetURL(s3, projectId, "control.html", "latest");
  if (isError(url)) return url;
  let data = await (await fetch(url)).text();

  if (env.CONTROLLER_FORMAT === undefined) {
    return raise("Unable to format controller");
  }

  for (const [k, v] of Object.entries(env.CONTROLLER_FORMAT)) {
    data = data.replaceAll(`{{${k}}}`, Json.stringify(v));
  }

  data = data.replaceAll("{{OBSERVATORY}}", observatory)
    .replaceAll("{{PROJECT_ID}}", projectId);

  return data;
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
  uploadFile,
  getPresignedGetURL,
  getPresignedPutURL,
  generateThumbnail,
  inviteCollaborator,
  removeCollaborator,
  getLayout,
  getEnv,
  getController
};

export default controller;
