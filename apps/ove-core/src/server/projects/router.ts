import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { safe } from "@ove/ove-utils";
import { logger } from "../../env";
import controller from "./controller";
import { type Client as MinioClient } from "minio";
import {
  FileSchema,
  type OVEException,
  OVEExceptionSchema
} from "@ove/ove-types";
import {
  type PrismaClient,
  type Invite,
  type Project,
  type Section,
  type User
} from "@prisma/client";
import { type JsonValue } from "@prisma/client/runtime/library";

const SectionSchema = z.strictObject({
  id: z.string(),
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
  asset: z.string(),
  assetId: z.string().nullable(),
  config: z.custom<JsonValue>(),
  states: z.string().array(),
  dataType: z.string(),
  projectId: z.string(),
  ordering: z.number()
});

const ProjectSchema = z.strictObject({
  id: z.string(),
  creatorId: z.string(),
  collaboratorIds: z.string().array(),
  created: z.date(),
  updated: z.date(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string().nullable(),
  publications: z.string().array(),
  presenterNotes: z.string(),
  notes: z.string(),
  tags: z.string().array(),
  isPublic: z.boolean()
});

const UserSchema = z.strictObject({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  email: z.string().nullable(),
  role: z.string(),
  projectIds: z.string().array()
});

const InviteSchema = z.strictObject({
  id: z.string(),
  sent: z.date(),
  status: z.string(),
  projectId: z.string(),
  senderId: z.string(),
  recipientId: z.string()
});

export type Controller = {
  getProjectsForUser: (prisma: PrismaClient, user: string) => Promise<Project[]>
  getProject: (prisma: PrismaClient, user: string, id: string) =>
    Promise<Project | null>
  getTagsForUser: (prisma: PrismaClient, user: string) =>
    Promise<string[]>
  getUsers: (prisma: PrismaClient) => Promise<User[]>
  getInvitesForProject: (prisma: PrismaClient, projectId: string) =>
    Promise<Invite[]>
  getFiles: (s3: MinioClient | null, projectId: string) =>
    Promise<z.infer<typeof FileSchema>[]>
  createProject: (
    prisma: PrismaClient,
    s3: MinioClient | null,
    username: string,
    project: Pick<Project, "title"> | undefined,
    layout: Omit<Section, "id" | "projectId">[] | undefined,
    files: string[] | undefined
  ) => Promise<
    { project: Project, layout: Section[], files?: string[] } | OVEException>
  saveProject: (prisma: PrismaClient, project: Project,
    layout: Section[]) => Promise<{
    project: Project,
    layout: Section[]
  }>
  getSectionsForProject: (prisma: PrismaClient, projectId: string) =>
    Promise<Section[]>
  uploadFile: (
    s3: MinioClient | null, projectId: string,
    objectName: string, data: string) => Promise<void | OVEException>
  getPresignedGetURL: (s3: MinioClient | null, projectId: string,
    objectName: string, versionId: string) => Promise<string | OVEException>
  getPresignedPutURL: (s3: MinioClient | null, projectId: string,
    objectName: string) => Promise<string | OVEException>
  generateThumbnail: (prisma: PrismaClient, projectId: string) =>
    Promise<string | OVEException>
  inviteCollaborator: (prisma: PrismaClient, projectId: string,
    senderId: string, recipientId: string) => Promise<void | OVEException>
  removeCollaborator: (prisma: PrismaClient, projectId: string,
    collaboratorId: string) => Promise<void | OVEException>
  getLayout: (prisma: PrismaClient, projectId: string) =>
    Promise<Section[] | OVEException>
  getEnv: (s3: MinioClient | null, projectId: string) =>
    Promise<object | OVEException>
  getController: (s3: MinioClient | null, projectId: string,
    observatory: string) => Promise<string | OVEException>
}

export const projectsRouter = router({
  getProjects: protectedProcedure
    .meta({ method: "GET", path: "/projects", protected: true })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, ProjectSchema.array()]))
    .query(async ({ ctx }) => {
      logger.info(`Getting projects for user ${ctx.user}`);
      return await safe(logger, () =>
        controller.getProjectsForUser(ctx.prisma, ctx.user));
    }),
  getProject: protectedProcedure
    .meta({ method: "GET", path: "/project/{projectId}", protected: true })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([OVEExceptionSchema, ProjectSchema.nullable()]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting project ${projectId}`);
      return await safe(logger, () =>
        controller.getProject(ctx.prisma, ctx.user, projectId));
    }),
  getTags: protectedProcedure
    .meta({ method: "GET", path: "/projects/tags", protected: true })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.string().array()]))
    .query(async ({ ctx }) => {
      logger.info("Getting tags for projects");
      return await safe(logger, () =>
        controller.getTagsForUser(ctx.prisma, ctx.user));
    }),
  getUsers: protectedProcedure
    .meta({ method: "GET", path: "/users", protected: true })
    .input(z.void())
    .output(z.union([UserSchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx }) => {
      logger.info("Getting users");
      return await safe(logger, () => controller.getUsers(ctx.prisma));
    }),
  getInvitesForProject: protectedProcedure
    .meta({
      method: "GET",
      path: "/project/{projectId}/collaborators/invites",
      protected: true
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([InviteSchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting invites for ${projectId}`);
      return await safe(logger, () =>
        controller.getInvitesForProject(ctx.prisma, projectId));
    }),
  getSectionsForProject: protectedProcedure
    .meta({
      method: "GET",
      path: "/project/{projectId}/sections",
      protected: true
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([OVEExceptionSchema, SectionSchema.array()]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting sections for ${projectId}`);
      return safe(logger, () =>
        controller.getSectionsForProject(ctx.prisma, projectId));
    }),
  createProject: protectedProcedure
    .meta({
      method: "POST",
      path: "/project/create",
      protected: true
    })
    .input(z.strictObject({
      project: ProjectSchema.pick({ title: true }).optional(),
      layout: SectionSchema.omit({
        id: true,
        PROJECT_ID: true
      }).array().optional(),
      files: z.string().array().optional()
    }))
    .output(z.union([OVEExceptionSchema, z.strictObject({
      project: ProjectSchema,
      layout: SectionSchema.array()
    })]))
    .mutation(async ({ ctx, input: { files, project, layout } }) => {
      logger.info("Creating new project");
      return safe(logger, () =>
        controller.createProject(ctx.prisma, ctx.s3, ctx.user,
          project, layout, files));
    }),
  saveProject: protectedProcedure
    .meta({
      method: "POST",
      path: "/project",
      protected: true
    })
    .input(z.strictObject({
      project: ProjectSchema,
      layout: SectionSchema.array()
    }))
    .output(z.union([OVEExceptionSchema, z.strictObject({
      project: ProjectSchema,
      layout: SectionSchema.array()
    })]))
    .mutation(async ({ ctx, input }) => {
      logger.info(`Saving project ${input.project.id}`);
      return safe(logger, () =>
        controller.saveProject(ctx.prisma, input.project, input.layout));
    }),
  getFiles: protectedProcedure
    .meta({
      method: "GET",
      path: "/project/{projectId}/files",
      protected: true
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([FileSchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting files for ${projectId}`);
      return await safe(logger, () => controller.getFiles(ctx.s3, projectId));
    }),
  getFileContents: protectedProcedure
    .meta({
      method: "GET",
      path: "/project/{projectId}/file",
      protected: true
    })
    .input(z.strictObject({
      projectId: z.string(),
      name: z.string(),
      version: z.number(),
      assetId: z.string()
    }))
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(async ({ input }) => {
      logger.info(`Getting data for ${input.name} v${input.version}`);
      return "";
    }),
  uploadFile: protectedProcedure
    .meta({
      method: "POST",
      path: "/project/{projectId}/file",
      protected: true
    })
    .input(z.strictObject({
      projectId: z.string(),
      name: z.string(),
      data: z.string()
    }))
    .output(z.union([z.void(), OVEExceptionSchema]))
    .mutation(async ({ ctx, input }) => {
      logger.info(`Uploading file: ${input.name}`);
      return await safe(logger, () =>
        controller.uploadFile(ctx.s3, input.projectId, input.name, input.data));
    }),
  getPresignedGetURL: protectedProcedure
    .meta({
      method: "GET",
      path: "/project/{projectId}/file/{objectName}/{versionId}/presigned/get",
      protected: true
    })
    .input(z.strictObject({
      projectId: z.string(),
      objectName: z.string(),
      versionId: z.string()
    }))
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(`Getting presigned 'GET' URL for ${input.objectName}/${input.versionId}`);
      return await safe(logger, () =>
        controller.getPresignedGetURL(ctx.s3, input.projectId,
          input.objectName, input.versionId));
    }),
  getPresignedPutURL: protectedProcedure
    .meta({
      method: "GET",
      path: "/project/{projectId}/file/{objectName}/presigned/put",
      protected: true
    })
    .input(z.strictObject({
      projectId: z.string(),
      objectName: z.string(),
      versionId: z.string()
    }))
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(`Getting presigned 'PUT' URL for ${input.objectName}/${input.versionId}`);
      return await safe(logger, () =>
        controller.getPresignedPutURL(ctx.s3,
          input.projectId, input.objectName));
    }),
  generateThumbnail: protectedProcedure
    .meta({
      method: "POST",
      path: "/project/{projectId}/thumbnail",
      protected: true
    })
    .input(z.strictObject({
      projectId: z.string()
    }))
    .output(z.union([z.string(), OVEExceptionSchema]))
    .mutation(async ({ ctx, input }) => {
      logger.info(`Generator thumbnail for ${input.projectId}`);
      return await safe(logger, () =>
        controller.generateThumbnail(ctx.prisma, input.projectId));
    }),
  inviteCollaborator: protectedProcedure
    .meta({
      method: "POST",
      path: "/project/{projectId}/collaborator",
      protected: true
    })
    .input(z.strictObject({
      projectId: z.string(),
      collaboratorId: z.string()
    }))
    .output(z.union([z.void(), OVEExceptionSchema]))
    .mutation(({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(`Inviting collaborator ${input.collaboratorId} to ${input.projectId}`);
      return safe(logger, () =>
        controller.inviteCollaborator(ctx.prisma,
          input.projectId, ctx.user, input.collaboratorId));
    }),
  removeCollaborator: protectedProcedure
    .meta({
      method: "DELETE",
      path: "/project/{projectId}/collaborator/{collaboratorId}",
      protected: true
    })
    .input(z.strictObject({
      projectId: z.string(),
      collaboratorId: z.string()
    }))
    .output(z.union([z.void(), OVEExceptionSchema]))
    .mutation(({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(`Removing collaborator ${input.collaboratorId} from ${input.projectId}`);
      return safe(logger, () =>
        controller.removeCollaborator(ctx.prisma,
          input.projectId, input.collaboratorId));
    }),
  getLayout: protectedProcedure
    .meta({
      method: "GET",
      path: "/layout",
      protected: true
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([SectionSchema.array(), OVEExceptionSchema]))
    .query(({ ctx, input: { projectId } }) => {
      logger.info(`Getting layout for ${projectId}`);
      return safe(logger, () => controller.getLayout(ctx.prisma, projectId));
    }),
  getEnv: protectedProcedure
    .meta({
      method: "GET",
      path: "/env",
      protected: true
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([z.custom(), OVEExceptionSchema]))
    .query(({ ctx, input: { projectId } }) => {
      logger.info(`Getting environment for ${projectId}`);
      return safe(logger, () => controller.getEnv(ctx.s3, projectId));
    }),
  getController: protectedProcedure
    .meta({
      method: "GET",
      path: "/control",
      protected: true
    })
    .input(z.strictObject({ projectId: z.string(), observatory: z.string() }))
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(({ ctx, input: { projectId, observatory } }) => {
      logger.info(`Getting controller for ${projectId}`);
      return safe(logger, () =>
        controller.getController(ctx.s3, projectId, observatory));
    })
});
