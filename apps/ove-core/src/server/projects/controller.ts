/* global __dirname, fetch, URL, Buffer */

import http from "http";
import path from "path";
import { File } from "buffer";
import { env } from "../../env";
import { nanoid } from "nanoid";
import type { Client } from "minio";
import { readFileSync } from "atomically";
import unzip, { Entry } from "unzip-stream";
import { S3Controller } from "./s3-controller";
import { type DataTypes, isError } from "@ove/ove-types";
import type { PrismaClient, Project, Section } from ".prisma/client";
import type { DataFormatConfigOptions, InviteStatus } from "./router";
import { assert, Json, raise, titleToBucketName } from "@ove/ove-utils";
import { fetch, Agent } from "undici";

import "@total-typescript/ts-reset";
import { generateToken } from "@ove/ove-auth";

const getProjectsForUser = async (prisma: PrismaClient, username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        {
          invites: {
            some: {
              recipientId: assert(user).id,
              status: "accepted",
            },
          },
        },
        {
          creatorId: assert(user).id,
        },
        {
          isPublic: true,
        },
      ],
    },
    include: {
      invites: true,
    },
  });
  return projects.map(({ invites: _invites, ...project }) => project);
};

const getProject = async (
  prisma: PrismaClient,
  username: string,
  id: string,
) => {
  if (id.length === 32) return null;
  const user = await prisma.user.findUnique({ where: { username } });

  const { invites: _invites, ...project } =
    await prisma.project.findUniqueOrThrow({
      where: {
        id,
        OR: [
          {
            invites: {
              some: {
                recipientId: assert(user).id,
                status: "accepted",
              },
            },
          },
          {
            creatorId: assert(user).id,
          },
          { isPublic: true },
        ],
      },
      include: {
        invites: true,
      },
    });
  return project;
};

const getTags = async (prisma: PrismaClient) => {
  const projects = await prisma.project.findMany({ select: { tags: true } });
  return projects.flatMap(({ tags }) => tags);
};

const getPublications = async (prisma: PrismaClient) => {
  const projects = await prisma.project.findMany({
    select: { publications: true },
  });
  return projects.flatMap(({ publications }) => publications);
};

const getUsers = async (prisma: PrismaClient) =>
  prisma.user.findMany({
    select: {
      email: true,
      icon: true,
      id: true,
      name: true,
      role: true,
      username: true,
    },
    where: {
      NOT: {
        role: "bridge",
      },
    },
  });

const getCollaboratorsForProject = async (
  prisma: PrismaClient,
  projectId: string,
) => {
  if (projectId.length === 32) return [];
  const raw = await prisma.invite.findMany({
    where: {
      projectId,
    },
    include: {
      recipient: true,
    },
  });
  const creator = (
    await prisma.project.findUniqueOrThrow({
      where: {
        id: projectId,
      },
      include: {
        creator: true,
      },
    })
  ).creator;

  return [
    ...raw.map((invite) => ({
      status: invite.status as InviteStatus,
      id: invite.recipient.id,
      name: invite.recipient.name,
      icon: invite.recipient.icon,
      email: invite.recipient.email,
    })),
    {
      status: "creator" as const,
      id: creator.id,
      name: creator.name,
      icon: creator.icon,
      email: creator.email,
    },
  ];
};

const createProject = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  project: Omit<Project, "id" | "creatorId" | "created" | "updated" | "bucket"> | undefined,
  layout: Omit<Section, "id" | "projectId">[] | undefined,
  files: string[] | undefined,
) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (user === null) {
    return raise("User cannot be null");
  }

  const input = project ?? {};
  const title = project?.title ?? nanoid(16);
  const bucketName = titleToBucketName(title);
  let files_: string[] | undefined = undefined;

  const project_ = await prisma.project.create({
    data: {
      ...input, 
      title,
      creatorId: user.id,
      bucket: bucketName,
    },
  });

  if (s3 !== null) {
    await S3Controller.createBucket(s3, bucketName);

    if (files === undefined || !files.includes("env.json")) {
      await S3Controller.uploadFile(
        s3,
        bucketName,
        "env.json",
        Json.EMPTY,
      );
    }
    if (files === undefined || !files.includes("control.html")) {
      const template = readFileSync(
        path.join(__dirname, "assets", "control-template.html"),
      ).toString();
      await S3Controller.uploadFile(
        s3,
        bucketName,
        "control.html",
        template,
      );
    }

    if (files !== undefined) {
      files_ = await Promise.all(
        files.map((file) =>
          S3Controller.getPresignedPutURL(s3, bucketName, file),
        ),
      );
    }
  }

  const layout_ = await Promise.all(
    (layout ?? []).map((section) =>
      prisma.section.create({
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
          projectId: project_.id,
        },
      }),
    ),
  );

  return { project: project_, layout: layout_, files: files_ };
};

const saveProject = async (
  prisma: PrismaClient,
  username: string,
  project: Project,
  layout: Section[],
) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  const { id, ...data } = project;
  const existing = await prisma.project.findUniqueOrThrow({
    where: {
      id,
    },
    include: { invites: true },
  });

  if (
    project.creatorId !== user?.id &&
    existing.invites.find(
      (invite) =>
        invite.recipientId === (user?.id ?? "ERROR") &&
        invite.status === "accepted",
    ) === undefined
  ) {
    throw new Error("Cannot make changes to public project");
  }

  const sectionIds = (await prisma.section.findMany()).map(({ id }) => id);
  const newSectionIds = layout.map(({ id }) => id).filter(Boolean);
  for (const sectionId of sectionIds) {
    if (newSectionIds.includes(sectionId)) continue;
    await prisma.section.delete({
      where: {
        id: sectionId,
      },
    });
  }

  const layout_ = await Promise.all(
    layout.map(async (section) => {
      if (section.id.length === 32) {
        // eslint-disable-next-line no-unused-vars
        const { id: _id, ...data } = section;
        return prisma.section.create({ data });
      } else {
        // eslint-disable-next-line no-unused-vars
        const { id, projectId: _projectId, ...data } = section;
        return prisma.section.update({ data, where: { id } });
      }
    }),
  );

  const project_ = await prisma.project.update({
    data,
    where: {
      id,
    },
  });

  return { project: project_, layout: layout_ };
};

const groupBy = <T extends object>(xs: T[], key: keyof T) =>
  xs.reduce(
    (rv, x) => {
      // @ts-expect-error - object keys
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    },
    {} as { [_Key in keyof T]: T[] },
  );

type RawFile = {
  versionId: string;
  isLatest: boolean;
  lastModified: Date;
};

const addLatest = <T extends RawFile>(files: T[]): T[] =>
  files.concat(
    files
      .filter(({ isLatest }) => isLatest)
      .map((file) => ({
        ...file,
        versionId: "latest",
        lastModified: new Date(),
        isLatest: false,
      })),
  );

const getProjectFiles = async (s3: Client, bucketName: string) => {
  const files = (await S3Controller.listObjects(s3, bucketName))
    .filter((obj) => !obj.name.includes("/") || obj.name.endsWith("dzi"))
    .map((obj) => ({
      ...obj,
      name: obj.name.includes("/") ? obj.name.split("/")[0] : obj.name,
    }));
  return Object.values(groupBy(files, "name"))
    .map((group) =>
      group
        .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime())
        .map((file, i) => ({
          ...file,
          versionId: `v${i}`,
        })),
    )
    .flat();
};

const getGlobalFiles = async (s3: Client) =>
  (
    await Promise.all(
      env.SERVICES.ASSET_STORE?.GLOBAL_BUCKETS.map(async (bucket) => {
        const objects = (await S3Controller.listObjects(s3, bucket))
          .filter((obj) => !obj.name.includes("/") || obj.name.endsWith("dzi"))
          .map((obj) => ({
            ...obj,
            name: obj.name.includes("/") ? obj.name.split("/")[0] : obj.name,
          }));
        return Object.values(groupBy(objects, "name"))
          .map((group) =>
            group
              .sort(
                (a, b) => a.lastModified.getTime() - b.lastModified.getTime(),
              )
              .map((obj, i) => ({
                ...obj,
                versionId: `v${i}`,
                bucketName: bucket,
              })),
          )
          .flat();
      }) ?? [],
    )
  )
    .flat()
    .map((object) => ({
      name: assert(object.name),
      version: object.versionId,
      isGlobal: true,
      isLatest: object.isLatest,
      bucketName: object.bucketName,
    }));

const getFiles = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  projectId: string,
) => {
  const project = await getProject(prisma, username, projectId);
  if (s3 === null || project === null) return [];
  const globals = await getGlobalFiles(s3);
  const projectFiles = addLatest(
    await getProjectFiles(s3, project.bucket ?? titleToBucketName(project.title)),
  )
    .map((object) => ({
      name: assert(object.name),
      version: object.versionId,
      isGlobal: false,
      isLatest: object.isLatest,
      bucketName: project.bucket ?? titleToBucketName(project.title),
    }))
    .filter(({ name }) => !name.includes("OVE_FORMAT"));
  return globals.concat(projectFiles);
};

const getSectionsForProject = async (
  prisma: PrismaClient,
  projectId: string,
) => {
  if (projectId.length === 32) return [];
  return prisma.section.findMany({
    where: {
      projectId,
    },
  });
};

const getS3Version = async (
  s3: Client,
  bucketName: string,
  objectName: string,
  versionId: string,
) => {
  const files = (
    await Promise.all(
      assert(env.SERVICES.ASSET_STORE)
        .GLOBAL_BUCKETS.concat([bucketName])
        .flatMap((bucket) => S3Controller.listObjects(s3, bucket)),
    )
  )
    .flat()
    .filter((file) => file.name === objectName)
    .sort((a, b) => a.lastModified.getTime() - b.lastModified.getTime());
  const idx =
    versionId === "latest" ? -1 : parseInt(versionId.substring(1));
  return assert(files.at(idx)).versionId;
};

const getPresignedGetURL = async (
  s3: Client | null,
  bucketName: string,
  objectName: string,
  versionId: string,
) => {
  if (s3 === null) return raise("No S3 store configured");
  return S3Controller.getPresignedGetURL(
    s3,
    bucketName,
    objectName,
    await getS3Version(s3, bucketName, objectName, versionId),
  );
};

const getPresignedPutURL = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  projectId: string,
  objectName: string,
) => {
  const project = await getProject(prisma, username, projectId);
  if (project === null) return raise(`No project with id ${projectId}`);
  if (s3 === null) return raise("No S3 store configured");
  return S3Controller.getPresignedPutURL(
    s3,
    project.bucket ?? titleToBucketName(project.title),
    objectName,
  );
};

const generateThumbnail = async (
  prisma: PrismaClient,
  projectId: string,
  tags: string[],
) => {
  if (env.SERVICES.THUMBNAIL_GENERATOR === undefined) {
    return raise("Thumbnail generator not configured");
  }
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (project === null) return raise("Project not found");
  if (project.thumbnail !== null) return raise("Thumbnail already exists");
  const prompt = encodeURI(tags.join(" "));
  const token = generateToken(
    { username: env.APP_NAME, role: "proxy" },
    {
      key: env.TOKENS.SIGNING_KEYS.PRIVATE,
      passphrase: env.TOKENS.SIGNING_KEYS.PASSPHRASE,
    },
    env.TOKENS.ACCESS.ISSUER,
    env.TOKENS.ACCESS.ALGORITHM,
    env.TOKENS.ACCESS.EXPIRY,
    env.TOKENS.ACCESS.AUDIENCE,
  );
  const thumbnail = await (
    await fetch(
      `${env.SERVICES.THUMBNAIL_GENERATOR}/generate?prompt=${prompt}`,
      {
        headers: {
          Authorization: `Bearer ${encodeURIComponent(token)}`,
        },
      },
    )
  ).text();
  await prisma.project.update({
    data: {
      thumbnail,
    },
    where: {
      id: projectId,
    },
  });
  return thumbnail;
};

const inviteCollaborator = async (
  prisma: PrismaClient,
  projectId: string,
  sender: string,
  recipientId: string,
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { username: sender },
  });
  await prisma.invite.create({
    data: {
      projectId,
      senderId: user.id,
      recipientId,
    },
  });
  return undefined;
};

const removeCollaborator = async (
  prisma: PrismaClient,
  projectId: string,
  recipientId: string,
) => {
  await prisma.invite.deleteMany({
    where: {
      recipientId,
      projectId,
    },
  });
  return undefined;
};

const getLayout = (prisma: PrismaClient, projectId: string) => {
  return prisma.section.findMany({ where: { projectId } });
};

const getEnv = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  projectId: string,
) => {
  if (s3 === null) return raise("No S3 store configured");
  const project = await getProject(prisma, username, projectId);
  if (project === null) return raise(`No project with id ${projectId}`);
  const url = await getPresignedGetURL(
    s3,
    project.bucket ?? titleToBucketName(project.title),
    "env.json",
    "latest",
  );
  if (isError(url)) return url;
  let agent: Agent | undefined = undefined;
  if (env.SERVICES.ASSET_STORE?.CA_FILE !== undefined) {
    agent = new Agent({ connect: { rejectUnauthorized: false } });
  }
  const data = (await (await fetch(url, { dispatcher: agent })).json()) as Record<string, string>;
  return Object.fromEntries(
    Object.entries(data)
      .filter(([k, _v]) => k.startsWith("OVE_PUBLIC_"))
      .map(([k, v]) => [k.substring(11), v]),
  );
};

const getController = async (
  prisma: PrismaClient,
  s3: Client | null,
  username: string,
  projectId: string,
  observatory: string,
) => {
  if (s3 === null) return raise("No S3 store configured");
  const project = await getProject(prisma, username, projectId);
  let data: string;
  if (project === null) {
    data = readFileSync(
      path.join(__dirname, "assets", "control-template.html"),
    ).toString();
  } else {
    const url = await getPresignedGetURL(
      s3,
      project.bucket ?? titleToBucketName(project.title),
      "control.html",
      "latest",
    );
    if (isError(url)) return url;
    let agent: Agent | undefined = undefined;
    if (env.SERVICES.ASSET_STORE?.CA_FILE !== undefined) {
      agent = new Agent({ connect: { rejectUnauthorized: false } });
    }
    data = await (await fetch(url, { dispatcher: agent })).text();
  }

  if (env.TEMPLATES?.CONTROLLER === undefined) {
    return raise("Unable to format controller");
  }

  for (const [k, v] of Object.entries(env.TEMPLATES.CONTROLLER)) {
    if (typeof v === "string") {
      data = data.replaceAll(`{{${k}}}`, v);
    } else {
      data = data.replaceAll(`${k}: {}`, `${k}: ${Json.stringify(v)}`);
    }
  }

  data = data
    .replaceAll("{{OBSERVATORY}}", observatory)
    .replaceAll("{{PROJECT_ID}}", projectId)
    .replaceAll("{{SPACE}}", env.TEMPLATES.CONTROLLER.SPACE);

  // if (layout !== undefined) {
  //   data = data.replaceAll(
  //     /project = await [^;]+/g,
  //     `project = ${JSON}`,
  //   );
  //   data = data.replaceAll(/projectEnv = [^;]+/g, "projectEnv = {}");
  //   data = data.replaceAll(
  //     /project\.layouts = [^;]+/g,
  //     `project.layouts = ${Json.stringify(layout, undefined, 2)}`,
  //   );
  // }

  return data;
};

const formatDataTable = (
  title: string,
  data: string,
  opts: DataFormatConfigOptions,
) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "table-format.html"),
  ).toString();
  if (!("tableSource" in opts)) {
    throw new Error("Missing options for data table formatting");
  }
  if (opts.tableSource === "csv" || opts.tableSource === "tsv") {
    template = template.replaceAll(
      "const data = null;",
      `const data = ${JSON.stringify(
        data
          .split("\n")
          .map((x) => x.split(opts.tableSource === "csv" ? "," : "\t")),
      )};`,
    );
    template = template.replaceAll(
      "const containsHeader = true;",
      `const containsHeader = ${opts.containsHeader ?? false};`,
    );
  } else {
    template = template.replaceAll("%%DATA%%", data);
  }

  template = template.replaceAll("%%TITLE%%", title);

  return template;
};

const formatJSON = (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "json-format.html"),
  ).toString();
  template = template.replaceAll("%%TITLE%%", title);
  return template.replaceAll("%%DATA%%", data);
};

const formatGeoJSON = (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "geojson-format.json"),
  ).toString();
  template = template.replaceAll("%%TITLE%%", title);
  const idx = data.indexOf(",");
  const basemap = data.substring(0, idx);
  template = template.replaceAll("%%BASEMAP%%", basemap);
  return template.replaceAll('"%%DATA%%"', data.substring(idx));
};

const formatHTML = (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "html-format.html"),
  ).toString();
  template = template.replaceAll("%%TITLE%%", title);
  return template.replaceAll("%%DATA%%", data);
};

const formatLatex = async (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "latex-format.html"),
  ).toString();
  template = template.replaceAll("%%TITLE%%", title);
  if (env.SERVICES.DATA_FORMATTER !== undefined) {
    const token = generateToken(
      { username: env.APP_NAME, role: "proxy" },
      {
        key: env.TOKENS.SIGNING_KEYS.PRIVATE,
        passphrase: env.TOKENS.SIGNING_KEYS.PASSPHRASE,
      },
      env.TOKENS.ACCESS.ISSUER,
      env.TOKENS.ACCESS.ALGORITHM,
      env.TOKENS.ACCESS.EXPIRY,
      env.TOKENS.ACCESS.AUDIENCE,
    );
    data = await (
      await fetch(`${env.SERVICES.DATA_FORMATTER}/latex`, {
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${encodeURIComponent(token)}`,
        },
        method: "POST",
        body: data,
      })
    ).text();
  }
  return template.replaceAll("%%DATA%%", data);
};

const formatMarkdown = async (title: string, data: string) => {
  let template = readFileSync(
    path.join(__dirname, "assets", "markdown-format.html"),
  ).toString();
  template = template.replaceAll("%%TITLE%%", title);
  if (env.SERVICES.DATA_FORMATTER !== undefined) {
    const token = generateToken(
      { username: env.APP_NAME, role: "proxy" },
      {
        key: env.TOKENS.SIGNING_KEYS.PRIVATE,
        passphrase: env.TOKENS.SIGNING_KEYS.PASSPHRASE,
      },
      env.TOKENS.ACCESS.ISSUER,
      env.TOKENS.ACCESS.ALGORITHM,
      env.TOKENS.ACCESS.EXPIRY,
      env.TOKENS.ACCESS.AUDIENCE,
    );
    data = await (
      await fetch(`${env.SERVICES.DATA_FORMATTER}/markdown`, {
        headers: {
          "Content-Type": "text/plain",
          Authorization: `Bearer ${encodeURIComponent(token)}`,
        },
        method: "POST",
        body: data,
      })
    ).text();
  }
  return template.replaceAll("%%DATA%%", data);
};

const formatData = async (
  title: string,
  dataType: DataTypes,
  data: string,
  opts?: DataFormatConfigOptions,
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
        fileName: `${fileName}.html`,
      };
    case "markdown":
      return {
        data: await formatMarkdown(title, data),
        fileName: `${fileName}.html`,
      };
    default:
      return { data, fileName: `${fileName}.${fileParts.at(-1)}` };
  }
};

const formatDZI = async (
  s3: Client | null,
  bucketName: string,
  objectName: string,
  versionId: string,
) => {
  if (s3 === null) return raise("No S3 store configured");
  const url = await getPresignedGetURL(s3, bucketName, objectName, versionId);
  if (isError(url)) return url;
  if (env.SERVICES.DATA_FORMATTER === undefined) {
    return raise("No data formatter configured");
  }
  const formatter = new URL(env.SERVICES.DATA_FORMATTER);
  await new Promise((resolve) => {
    const data = Json.stringify({
      get_url: url,
    });

    const token = generateToken(
      { username: env.APP_NAME, role: "proxy" },
      {
        key: env.TOKENS.SIGNING_KEYS.PRIVATE,
        passphrase: env.TOKENS.SIGNING_KEYS.PASSPHRASE,
      },
      env.TOKENS.ACCESS.ISSUER,
      env.TOKENS.ACCESS.ALGORITHM,
      env.TOKENS.ACCESS.EXPIRY,
      env.TOKENS.ACCESS.AUDIENCE,
    );

    const options = {
      host: formatter.hostname,
      port: formatter.port,
      path: `${formatter.pathname}/dzi`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data),
        Authorization: `Bearer ${encodeURIComponent(token)}`,
      },
    };

    const req = http.request(options, (res) => {
      res
        .pipe(unzip.Parse())
        .on("entry", async (entry: Entry) => {
          const dziRootName = objectName.replaceAll(
            /(?:png|jpg|jpeg|PNG|JPEG|JPG)$/g,
            "dzi",
          );
          const dziObjectName = `${dziRootName}/${entry.path}`;
          const entryURL = await S3Controller.getPresignedPutURL(
            s3,
            bucketName,
            dziObjectName,
          );

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const [size, chunks] = await new Promise<[number, any[]]>(
            (resolve) => {
              let size = 0;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const chunks: any[] = [];
              entry
                .on("data", (chunk) => {
                  size += chunk.length;
                  chunks.push(chunk);
                })
                .on("end", () => {
                  resolve([size, chunks]);
                });
            },
          );

          let agent: Agent | undefined = undefined;
          if (env.SERVICES.ASSET_STORE?.CA_FILE !== undefined) {
            agent = new Agent({ connect: { rejectUnauthorized: false } });
          }
          await fetch(entryURL, {
            dispatcher: agent,
            method: "PUT",
            body: await new File(
              [Buffer.from(chunks)],
              entry.path,
            ).arrayBuffer(),
            headers: { "Content-Length": `${size}` },
          });
        })
        .on("finish", resolve);
    });

    req.write(data);
    req.end();
  });
  return undefined;
};

const getCollaborationInvites = async (
  prisma: PrismaClient,
  username: string,
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      username,
    },
  });

  return prisma.invite.findMany({
    where: {
      recipientId: user.id,
    },
    include: {
      project: true,
    },
  });
};

const getSentInvites = async (
  prisma: PrismaClient,
  username: string,
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      username,
    },
  });

  return prisma.invite.findMany({
    where: {
      senderId: user.id,
    },
    include: {
      project: true,
    },
  });
};

const acceptInvite = async (prisma: PrismaClient, inviteId: string) => {
  await prisma.invite.update({
    where: {
      id: inviteId,
    },
    data: {
      status: "accepted",
    },
  });
};

const declineInvite = async (prisma: PrismaClient, inviteId: string) => {
  await prisma.invite.update({
    where: {
      id: inviteId,
    },
    data: {
      status: "declined",
    },
  });
};

const getPendingInviteCount = async (
  prisma: PrismaClient,
  username: string,
) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      username,
    },
  });

  return prisma.invite.count({
    where: {
      recipientId: user.id,
      status: "pending",
    },
  });
};

const controller = {
  getProjectsForUser,
  getProject,
  getTags,
  getPublications,
  getUsers,
  getCollaboratorsForProject,
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
  formatDZI,
  getCollaborationInvites,
  getSentInvites,
  acceptInvite,
  declineInvite,
  getPendingInviteCount,
};

export default controller;
