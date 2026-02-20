/* global __dirname, URL, Buffer */

import path from "node:path";
import { env } from "../../env";
import { nanoid } from "nanoid";
import type { Client } from "minio";
import { readFileSync } from "atomically";
import { S3Controller } from "./s3-controller";
import type { InviteStatus } from "../schemas";
import type { PrismaClient, Project, Section } from ".prisma/client";
import { assert, Json, titleToBucketName } from "@ove/ove-utils";

import "@total-typescript/ts-reset";
import { generateImage, uploadImage } from "./thumbnails/image-generator";

const getProjectsForUser = async (prisma: PrismaClient, username: string) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  const projects = await prisma.project.findMany({
    where: {
      isDeleted: false,
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
    omit: {
      isDeleted: true,
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
      omit: {
        isDeleted: true,
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
      isDeleted: false,
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
  project:
    | Omit<
        Project,
        | "id"
        | "creatorId"
        | "created_at"
        | "updated_at"
        | "bucket"
        | "isDeleted"
      >
    | undefined,
  layout:
    | Omit<Section, "id" | "projectId" | "created_at" | "updated_at">[]
    | undefined,
  files: string[] | undefined,
) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });
  if (user === null) {
    throw new Error("User cannot be null");
  }

  const input = project ?? {};
  const title = project?.title ?? nanoid(16);
  const bucketName = titleToBucketName(title);
  let files_: string[] | undefined = undefined;

  const { isDeleted, ...project_ } = await prisma.project.create({
    data: {
      ...input,
      title,
      creatorId: user.id,
      bucket: bucketName,
    },
  });

  if (s3 !== null) {
    await S3Controller.createBucket(s3, bucketName);
    if (env.SERVICES.DATA_FORMATTER !== undefined) {
      await S3Controller.setBucketNotification(s3, bucketName, {
        arn: env.SERVICES.DATA_FORMATTER.WEBHOOK_ARN,
      });
    }

    if (files === undefined || !files.includes("env.json")) {
      await S3Controller.uploadFile(s3, bucketName, "env.json", Json.EMPTY);
    }
    if (files === undefined || !files.includes("control.html")) {
      const template = readFileSync(
        path.join(__dirname, "assets", "control-template.html"),
      ).toString();
      await S3Controller.uploadFile(s3, bucketName, "control.html", template);
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
  project: Omit<Project, "isDeleted">,
  layout: Omit<Section, "created_at" | "updated_at">[],
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
     && user?.role !== "admin"
  ) {
    throw new Error("Cannot make changes to public project");
  }

  const sectionIds = (
    await prisma.section.findMany({
      where: { projectId: id },
    })
  ).map(({ id }) => id);
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
        return prisma.section.update({
          data: { ...data, updated_at: new Date() },
          where: { id },
        });
      }
    }),
  );

  const { isDeleted, ...project_ } = await prisma.project.update({
    data: { ...data, updated_at: new Date() },
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
    .filter((obj) => !obj.name.startsWith("__formatted__/"))
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
          .filter((obj) => !obj.name.startsWith("__formatted__/"))
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
    await getProjectFiles(
      s3,
      project.bucket ?? titleToBucketName(project.title),
    ),
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
  const idx = versionId === "latest" ? -1 : parseInt(versionId.substring(1));
  return assert(files.at(idx)).versionId;
};

const getConversionStatus = async (
  s3: Client | null,
  bucketName: string,
  objectName: string,
  versionId: string,
) => {
  if (s3 === null) throw new Error("No S3 store configured");
  let ext: string | undefined = undefined;
  if ([".jpg", ".jpeg", ".png", ".tiff", ".tif", ".webp"].includes(
    path.extname(objectName),
  )) {
    ext = ".dzi"
  } else if ([".md", ".markdown", ".tex", ".latex"].includes(path.extname(objectName))) {
    ext = ".html"
  }
  if (ext === undefined) return false;
  try {
    await S3Controller.statObject(
      s3,
      bucketName,
      `__formatted__/${objectName}/${await getS3Version(s3, bucketName, objectName, versionId)}${ext}`,
    );
    return true;
  } catch (e) {
    return false;
  }
};

// TODO: integrate with file proxy
const getPresignedGetURL = async (
  s3: Client | null,
  bucketName: string,
  objectName: string,
  versionId: string,
  isThumbnail: boolean = false,
) => {
  if (s3 === null) throw new Error("No S3 store configured");
  let formattedVersion: string = await getS3Version(s3, bucketName, objectName, versionId);
  // Get latest version of asset
  if (versionId === "latest") {
    const stat = await S3Controller.statObject(s3, bucketName, objectName);
    formattedVersion = stat.versionId ?? formattedVersion;
  }
  // If item could have a formatted version and isn't a thumbnail, check if it exists and update
  let formattedName = objectName;
  if ([".md", ".markdown"].includes(path.extname(objectName))) {
    formattedName = `__formatted__/${objectName}/${formattedVersion}.html`;
    try {
      const stat = await S3Controller.statObject(s3, bucketName, formattedName);
      formattedVersion = stat.versionId ?? formattedVersion;
    } catch (e) {
      formattedName = env.SERVICES.DATA_FORMATTER?.MISSING_DATA.HTML ?? objectName;
    }
  } else if ([".tex", ".latex"].includes(path.extname(objectName))) {
    formattedName = `__formatted__/${objectName}/${formattedVersion}.html`;
    try {
      const stat = await S3Controller.statObject(s3, bucketName, formattedName);
      formattedVersion = stat.versionId ?? formattedVersion;
    } catch (e) {
      formattedName = env.SERVICES.DATA_FORMATTER?.MISSING_DATA.HTML ?? objectName;
    }
  }/* else if (!isThumbnail &&
    [".jpg", ".jpeg", ".png", ".tiff", ".tif", ".webp"].includes(
      path.extname(objectName),
    )
  ) {
    formattedName = `__formatted__/${objectName}/${formattedVersion}.dzi`;
    try {
      const stat = await S3Controller.statObject(s3, bucketName, formattedName);
      formattedVersion = stat.versionId ?? formattedVersion;
    } catch (e) {
      formattedName = objectName;
    }
  }*/
  return S3Controller.getPresignedGetURL(
    s3,
    bucketName,
    formattedName,
    formattedVersion,
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
  if (project === null) throw new Error(`No project with id ${projectId}`);
  if (s3 === null) throw new Error("No S3 store configured");
  return S3Controller.getPresignedPutURL(
    s3,
    project.bucket ?? titleToBucketName(project.title),
    objectName,
  );
};

const generateThumbnail = async (
  prisma: PrismaClient,
  s3: Client | null,
  projectId: string,
  tags: string[],
) => {
  if (env.SERVICES.THUMBNAIL_GENERATOR === undefined) {
    throw new Error("Thumbnail generator not configured");
  }
  if (s3 === null) throw new Error("No S3 store configured");
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (project === null) throw new Error("Project not found");
  if (project.thumbnail !== null) throw new Error("Thumbnail already exists");

  const image = await generateImage(tags);

  if (!image.base64Image) {
    throw new Error("No base64 image returned");
  }

  const res = await uploadImage(
    s3,
    project.bucket ?? titleToBucketName(project.title),
    "thumbnail.png",
    image.base64Image,
  );
  const thumbnail = `/store/${project.bucket ?? titleToBucketName(project.title)}/thumbnail.png?versionId=${res.versionId ?? "latest"}`
  await prisma.project.update({
    data: {
      thumbnail,
      updated_at: new Date(),
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
  if (s3 === null) throw new Error("No S3 store configured");
  const project = await getProject(prisma, username, projectId);
  if (project === null) throw new Error(`No project with id ${projectId}`);
  const url = await getPresignedGetURL(
    s3,
    project.bucket ?? titleToBucketName(project.title),
    "env.json",
    "latest",
  );
  const data = (await (await fetch(url)).json()) as Record<string, string>;
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
  layout: string | undefined,
) => {
  if (s3 === null) throw new Error("No S3 store configured");
  const project = await getProject(prisma, username, projectId);
  let data: string;
  let envJson: Record<string, unknown> = {};
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
    data = await (await fetch(url)).text();

    const envUrl = await getPresignedGetURL(
      s3,
      project.bucket ?? titleToBucketName(project.title),
      "env.json",
      "latest",
    );
    envJson = (await (await fetch(envUrl)).json()) as Record<string, unknown>;
  }

  if (env.TEMPLATES?.CONTROLLER === undefined) {
    throw new Error("Unable to format controller");
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
    .replaceAll("{{SPACE}}", env.TEMPLATES.CONTROLLER.SPACE)
    .replaceAll("{{SERVER}}", env.TEMPLATES.CONTROLLER.SERVER)
    .replaceAll("{{RENDERER}}", env.TEMPLATES.CONTROLLER.RENDERER);

  if (layout !== undefined) {
    data = data
      .replaceAll(
        /project = await [^;]+/g,
        `project = ${Json.stringify(project, undefined, 2)}`,
      )
      .replaceAll(
        /projectEnv = [^;]+/g,
        `projectEnv = ${Json.stringify(envJson, undefined, 2)}`,
      )
      .replaceAll(
        /project\.layouts = [^;]+/g,
        `project.layouts = ${Json.stringify(Json.parse(layout), undefined, 2)}`,
      );
  }

  return data;
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

const getSentInvites = async (prisma: PrismaClient, username: string) => {
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
      updated_at: new Date(),
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
      updated_at: new Date(),
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

const recordProjectLaunch = async (prisma: PrismaClient, projectId: string) => {
  await prisma.projectLaunch.create({
    data: {
      projectId,
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
  getConversionStatus,
  getCollaborationInvites,
  getSentInvites,
  acceptInvite,
  declineInvite,
  getPendingInviteCount,
  recordProjectLaunch,
};

export default controller;
