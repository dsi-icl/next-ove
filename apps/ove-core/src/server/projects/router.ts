import {
  FileSchema,
  type OVEException,
  OVEExceptionSchema,
  type DataTypes,
  DataTypesSchema
} from "@ove/ove-types";
import type {
  PrismaClient,
  Invite,
  Project,
  Section,
  User
} from "@prisma/client";
import { z } from "zod";
import { logger } from "../../env";
import controller from "./controller";
import { Json, safe } from "@ove/ove-utils";
import type { Client as MinioClient } from "minio";
import { protectedProcedure, router } from "../trpc";

const SectionSchema = z.strictObject({
  id: z.string(),
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
  asset: z.string(),
  assetId: z.string().nullable(),
  states: z.string().array(),
  dataType: z.string(),
  projectId: z.string(),
  ordering: z.number()
});

const ProjectSchema = z.strictObject({
  id: z.string(),
  creatorId: z.string(),
  collaboratorIds: z.string().array(),
  created: z.string(),
  updated: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string().nullable(),
  publications: z.string().array(),
  presenterNotes: z.string(),
  notes: z.string(),
  tags: z.string().array(),
  isPublic: z.boolean()
});

const ProjectSchemaOutput = ProjectSchema.omit({created: true, updated: true}).extend({created: z.date(), updated: z.date()})

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

const DataFormatConfigOptionsSchema = z.strictObject({
  containsHeader: z.boolean().optional(),
  tableSource: z.union([z.literal("csv"), z.literal("html"), z.literal("tsv")]).optional()
});

export type DataFormatConfigOptions = z.infer<typeof DataFormatConfigOptionsSchema>

export type Controller = {
  getProjectsForUser: (prisma: PrismaClient, user: string) => Promise<Project[]>
  getProject: (prisma: PrismaClient, user: string, id: string) =>
    Promise<Project | null>
  getTagsForUser: (prisma: PrismaClient, user: string) =>
    Promise<string[]>
  getUsers: (prisma: PrismaClient) => Promise<User[]>
  getInvitesForProject: (prisma: PrismaClient, projectId: string) =>
    Promise<Invite[]>
  getFiles: (prisma: PrismaClient, s3: MinioClient | null, username: string, projectId: string) =>
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
  saveProject: (prisma: PrismaClient, username: string, project: Project,
    layout: Section[]) => Promise<{
    project: Project,
    layout: Section[]
  }>
  getSectionsForProject: (prisma: PrismaClient, projectId: string) =>
    Promise<Section[]>
  getPresignedGetURL: (s3: MinioClient | null, bucketName: string,
    objectName: string, versionId: string) => Promise<string | OVEException>
  getPresignedPutURL: (prisma: PrismaClient, s3: MinioClient | null, username: string, projectId: string,
    objectName: string) => Promise<string | OVEException>
  generateThumbnail: (prisma: PrismaClient, projectId: string) =>
    Promise<string | OVEException>
  inviteCollaborator: (prisma: PrismaClient, projectId: string,
    senderId: string, recipientId: string) => Promise<void | OVEException>
  removeCollaborator: (prisma: PrismaClient, projectId: string,
    collaboratorId: string) => Promise<void | OVEException>
  getLayout: (prisma: PrismaClient, projectId: string) =>
    Promise<Section[] | OVEException>
  getEnv: (prisma: PrismaClient, s3: MinioClient | null, username: string, projectId: string) =>
    Promise<object | OVEException>
  getController: (prisma: PrismaClient, s3: MinioClient | null, username: string, projectId: string,
    observatory: string, layout?: Section[]) => Promise<string | OVEException>
  formatData: (title: string, dataType: DataTypes, data: string, opts?: DataFormatConfigOptions) => Promise<{
    data: string
    fileName: string
  } | OVEException>
}

export const projectsRouter = router({
  getProjects: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/projects", protect: true } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, ProjectSchemaOutput.array()]))
    .query(async ({ ctx }) => {
      logger.info(`Getting projects for user ${ctx.user}`);
      return await safe(logger, () =>
        controller.getProjectsForUser(ctx.prisma, ctx.user));
    }),
  getProject: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}",
        protect: true
      }
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([OVEExceptionSchema, ProjectSchemaOutput.nullable()]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting project ${projectId}`);
      return await safe(logger, () =>
        controller.getProject(ctx.prisma, ctx.user, projectId));
    }),
  getTags: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/projects/tags", protect: true } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.string().array()]))
    .query(async ({ ctx }) => {
      logger.info("Getting tags for projects");
      return await safe(logger, () =>
        controller.getTagsForUser(ctx.prisma, ctx.user));
    }),
  getUsers: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/users", protect: true } })
    .input(z.void())
    .output(z.union([UserSchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx }) => {
      logger.info("Getting users");
      return await safe(logger, () => controller.getUsers(ctx.prisma));
    }),
  getInvitesForProject: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/collaborators/invites",
        protect: true
      }
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
      openapi: {
        method: "GET",
        path: "/project/{projectId}/sections",
        protect: true
      }
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
      openapi: {
        method: "POST",
        path: "/project/create",
        protect: true
      }
    })
    .input(z.strictObject({
      project: ProjectSchema.pick({ title: true }).optional(),
      layout: SectionSchema.omit({
        id: true,
        projectId: true
      }).array().optional(),
      files: z.string().array().optional()
    }))
    .output(z.union([OVEExceptionSchema, z.strictObject({
      project: ProjectSchemaOutput,
      layout: SectionSchema.array(),
      files: z.string().array().optional()
    })]))
    .mutation(async ({ ctx, input: { files, project, layout } }) => {
      logger.info("Creating new project");
      const res = await safe(logger, () =>
        controller.createProject(ctx.prisma, ctx.s3, ctx.user,
          project, layout, files));
      z.strictObject({
        project: ProjectSchemaOutput,
        layout: SectionSchema.array(),
        files: z.string().array().optional()
      }).parse(res);
      return res;
    }),
  saveProject: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/project",
        protect: true
      }
    })
    .input(z.strictObject({
      project: ProjectSchema,
      layout: SectionSchema.array()
    }))
    .output(z.union([OVEExceptionSchema, z.strictObject({
      project: ProjectSchemaOutput,
      layout: SectionSchema.array()
    })]))
    .mutation(async ({ ctx, input }) => {
      logger.info(`Saving project ${input.project.id}`);
      return safe(logger, () =>
        controller.saveProject(ctx.prisma, ctx.user, { ...input.project, created: new Date(input.project.created), updated: new Date(input.project.updated) }, input.layout));
    }),
  getFiles: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/files",
        protect: true
      }
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([FileSchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting files for ${projectId}`);
      return await safe(logger, () => controller.getFiles(ctx.prisma, ctx.s3, ctx.user, projectId));
    }),
  getFileContents: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/file",
        protect: true
      }
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
  getPresignedGetURL: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{bucketName}/file/{objectName}/{versionId}/presigned/get",
        protect: true
      }
    })
    .input(z.strictObject({
      bucketName: z.string(),
      objectName: z.string(),
      versionId: z.string()
    }))
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(`Getting presigned 'GET' URL for ${input.objectName}/${input.versionId}`);
      return await safe(logger, () =>
        controller.getPresignedGetURL(ctx.s3, input.bucketName,
          input.objectName, input.versionId));
    }),
  getPresignedPutURL: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/file/{objectName}/presigned/put",
        protect: true
      }
    })
    .input(z.strictObject({
      projectId: z.string(),
      objectName: z.string()
    }))
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(`Getting presigned 'PUT' URL for ${input.objectName}`);
      return await safe(logger, () =>
        controller.getPresignedPutURL(ctx.prisma, ctx.s3, ctx.user,
          input.projectId, input.objectName));
    }),
  generateThumbnail: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/project/{projectId}/thumbnail",
        protect: true
      }
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
      openapi: {
        method: "POST",
        path: "/project/{projectId}/collaborator",
        protect: true
      }
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
      openapi: {
        method: "DELETE",
        path: "/project/{projectId}/collaborator/{collaboratorId}",
        protect: true
      }
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
      openapi: {
        method: "GET",
        path: "/project/{projectId}/layout",
        protect: true
      }
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([SectionSchema.array(), OVEExceptionSchema]))
    .query(({ ctx, input: { projectId } }) => {
      logger.info(`Getting layout for ${projectId}`);
      return safe(logger, () => controller.getLayout(ctx.prisma, projectId));
    }),
  getEnv: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/env",
        protect: true
      }
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([z.custom(), OVEExceptionSchema]))
    .query(({ ctx, input: { projectId } }) => {
      logger.info(`Getting environment for ${projectId}`);
      return safe(logger, () => controller.getEnv(ctx.prisma, ctx.s3, ctx.user, projectId));
    }),
  getController: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/control",
        protect: true
      }
    })
    .input(z.strictObject({
      projectId: z.string(),
      observatory: z.string(),
      layout: z.string().optional()
    }))
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(({ ctx, input: { projectId, observatory, layout } }) => {
      logger.info(`Getting controller for ${projectId}`);
      return safe(logger, () =>
        controller.getController(ctx.prisma, ctx.s3, ctx.user, projectId, observatory, SectionSchema.array().optional().parse(layout === undefined ? undefined : Json.parse(layout))));
    }),
  formatData: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: "/project/data/format",
        protect: true
      }
    })
    .input(z.strictObject({ title: z.string(), dataType: DataTypesSchema, data: z.string(), opts: DataFormatConfigOptionsSchema.optional() }))
    .output(z.union([z.strictObject({data: z.string(), fileName: z.string()}), OVEExceptionSchema]))
    .mutation(({ input: { title, dataType, data, opts } }) => {
      logger.info(`Formatting data of type ${dataType}`);
      return safe(logger, () => controller.formatData(title, dataType, data, opts));
    })
});
