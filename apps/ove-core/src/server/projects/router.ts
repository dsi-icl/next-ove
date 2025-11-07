import {
  DataTypesSchema,
  FileSchema,
  OVEExceptionSchema,
} from "@ove/ove-types";
import { z } from "zod";
import { logger } from "../../env";
import controller from "./controller";
import { safe } from "@ove/ove-utils";
import { procedure, router } from "../trpc";

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
  ordering: z.number(),
});

const ProjectSchema = z.strictObject({
  id: z.string(),
  creatorId: z.string(),
  created: z.string(),
  updated: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string().nullable(),
  publications: z.string().array(),
  presenterNotes: z.string(),
  notes: z.string(),
  tags: z.string().array(),
  isPublic: z.boolean(),
  bucket: z.string().nullable(),
});

const ProjectSchemaOutput = ProjectSchema.omit({
  created: true,
  updated: true,
}).extend({ created: z.date(), updated: z.date() });

const InviteSchema = z.strictObject({
  id: z.string(),
  sent: z.date(),
  status: z.string(),
  projectId: z.string(),
  project: ProjectSchemaOutput,
  senderId: z.string(),
  recipientId: z.string(),
});

const UserSchema = z.strictObject({
  id: z.string(),
  username: z.string(),
  email: z.string().nullable(),
  role: z.string(),
  icon: z.string().nullable(),
  name: z.string().nullable(),
});

const InviteStatusSchema = z.union([
  z.literal("pending"),
  z.literal("accepted"),
  z.literal("declined"),
  z.literal("creator"),
]);
export type InviteStatus = z.infer<typeof InviteStatusSchema>;

const CollaboratorSchema = z.strictObject({
  status: InviteStatusSchema,
  id: z.string(),
  name: z.string().nullable(),
  icon: z.string().nullable(),
  email: z.string().nullable(),
});
export type Collaborator = z.infer<typeof CollaboratorSchema>;

const DataFormatConfigOptionsSchema = z.strictObject({
  containsHeader: z.boolean().optional(),
  tableSource: z
    .union([z.literal("csv"), z.literal("html"), z.literal("tsv")])
    .optional(),
});

export type DataFormatConfigOptions = z.infer<
  typeof DataFormatConfigOptionsSchema
>;

export const projectsRouter = router({
  getProjects: procedure
    .meta({ openapi: { method: "GET", path: "/projects", protect: true } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, ProjectSchemaOutput.array()]))
    .query(async ({ ctx }) => {
      logger.info(`Getting projects for user ${ctx.username}`);
      return await safe(logger, async () =>
        controller.getProjectsForUser(ctx.prisma, ctx.username),
      );
    }),
  getProject: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([OVEExceptionSchema, ProjectSchemaOutput.nullable()]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting project ${projectId}`);
      return await safe(logger, () =>
        controller.getProject(ctx.prisma, ctx.username, projectId),
      );
    }),
  getTags: procedure
    .meta({ openapi: { method: "GET", path: "/projects/tags", protect: true } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.string().array()]))
    .query(async ({ ctx }) => {
      logger.info("Getting tags");
      return await safe(logger, () => controller.getTags(ctx.prisma));
    }),
  getPublications: procedure
    .meta({
      openapi: { method: "GET", path: "/projects/publications", protect: true },
    })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.string().array()]))
    .query(async ({ ctx }) => {
      logger.info("Getting publications");
      return await safe(logger, () => controller.getPublications(ctx.prisma));
    }),
  getUsers: procedure
    .meta({ openapi: { method: "GET", path: "/users", protect: true } })
    .input(z.void())
    .output(z.union([UserSchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx }) => {
      logger.info("Getting users");
      return await safe(logger, () => controller.getUsers(ctx.prisma));
    }),
  getCollaboratorsForProject: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/collaborators",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([CollaboratorSchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting collaborators for ${projectId}`);
      return await safe(logger, () =>
        controller.getCollaboratorsForProject(ctx.prisma, projectId),
      );
    }),
  getSectionsForProject: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/sections",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([OVEExceptionSchema, SectionSchema.array()]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting sections for ${projectId}`);
      return safe(logger, () =>
        controller.getSectionsForProject(ctx.prisma, projectId),
      );
    }),
  createProject: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/project/create",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        project: ProjectSchema.omit({
          id: true, 
          creatorId: true, 
          created: true, 
          updated: true, 
          bucket: true
        }).optional(),
        layout: SectionSchema.omit({
          id: true,
          projectId: true,
        })
          .array()
          .optional(),
        files: z.string().array().optional(),
      }),
    )
    .output(
      z.union([
        OVEExceptionSchema,
        z.strictObject({
          project: ProjectSchemaOutput,
          layout: SectionSchema.array(),
          files: z.string().array().optional(),
        }),
      ]),
    )
    .mutation(async ({ ctx, input: { files, project, layout } }) => {
      logger.info("Creating new project");
      return safe(logger, () =>
        controller.createProject(
          ctx.prisma,
          ctx.s3,
          ctx.username,
          project,
          layout,
          files,
        ),
      );
    }),
  saveProject: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/project",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        project: ProjectSchema,
        layout: SectionSchema.array(),
      }),
    )
    .output(
      z.union([
        OVEExceptionSchema,
        z.strictObject({
          project: ProjectSchemaOutput,
          layout: SectionSchema.array(),
        }),
      ]),
    )
    .mutation(async ({ ctx, input }) => {
      logger.info(`Saving project ${input.project.id}`);
      return safe(logger, () =>
        controller.saveProject(
          ctx.prisma,
          ctx.username,
          {
            ...input.project,
            created: new Date(input.project.created),
            updated: new Date(input.project.updated),
          },
          input.layout,
        ),
      );
    }),
  getFiles: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/files",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([FileSchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting files for ${projectId}`);
      return await safe(logger, () =>
        controller.getFiles(ctx.prisma, ctx.s3, ctx.username, projectId),
      );
    }),
  getFileContents: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/file",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        projectId: z.string(),
        name: z.string(),
        version: z.number(),
        assetId: z.string(),
      }),
    )
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(async ({ input }) => {
      logger.info(`Getting data for ${input.name} v${input.version}`);
      return "";
    }),
  getPresignedGetURL: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{bucketName}/file/{objectName}/{versionId}/presigned/get",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        bucketName: z.string(),
        objectName: z.string(),
        versionId: z.string(),
      }),
    )
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(
        `Getting presigned 'GET' URL for ${input.objectName}/${input.versionId}`,
      );
      return await safe(logger, () =>
        controller.getPresignedGetURL(
          ctx.s3,
          input.bucketName,
          input.objectName,
          input.versionId,
        ),
      );
    }),
  getPresignedPutURL: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/file/{objectName}/presigned/put",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        projectId: z.string(),
        objectName: z.string(),
      }),
    )
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(async ({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(`Getting presigned 'PUT' URL for ${input.objectName}`);
      return await safe(logger, () =>
        controller.getPresignedPutURL(
          ctx.prisma,
          ctx.s3,
          ctx.username,
          input.projectId,
          input.objectName,
        ),
      );
    }),
  generateThumbnail: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/project/{projectId}/thumbnail",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        projectId: z.string(),
        tags: z.string().array(),
      }),
    )
    .output(z.union([z.string(), OVEExceptionSchema]))
    .mutation(async ({ ctx, input }) => {
      logger.info(`Generator thumbnail for ${input.projectId}`);
      return await safe(logger, () =>
        controller.generateThumbnail(ctx.prisma, input.projectId, input.tags),
      );
    }),
  inviteCollaborator: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/project/{projectId}/collaborator",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        projectId: z.string(),
        collaboratorId: z.string(),
      }),
    )
    .output(z.union([z.undefined(), OVEExceptionSchema]))
    .mutation(({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(
        `Inviting collaborator ${input.collaboratorId} to ${input.projectId}`,
      );
      return safe(logger, () =>
        controller.inviteCollaborator(
          ctx.prisma,
          input.projectId,
          ctx.username,
          input.collaboratorId,
        ),
      );
    }),
  removeCollaborator: procedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/project/{projectId}/collaborator/{collaboratorId}",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        projectId: z.string(),
        collaboratorId: z.string(),
      }),
    )
    .output(z.union([z.undefined(), OVEExceptionSchema]))
    .mutation(({ ctx, input }) => {
      // eslint-disable-next-line max-len
      logger.info(
        `Removing collaborator ${input.collaboratorId} from ${input.projectId}`,
      );
      return safe(logger, () =>
        controller.removeCollaborator(
          ctx.prisma,
          input.projectId,
          input.collaboratorId,
        ),
      );
    }),
  getLayout: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/layout",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([SectionSchema.array(), OVEExceptionSchema]))
    .query(({ ctx, input: { projectId } }) => {
      logger.info(`Getting layout for ${projectId}`);
      return safe(logger, () => controller.getLayout(ctx.prisma, projectId));
    }),
  getEnv: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/env",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([z.custom(), OVEExceptionSchema]))
    .query(({ ctx, input: { projectId } }) => {
      logger.info(`Getting environment for ${projectId}`);
      return safe(logger, () =>
        controller.getEnv(ctx.prisma, ctx.s3, ctx.username, projectId),
      );
    }),
  getController: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/control",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        projectId: z.string(),
        observatory: z.string(),
      }),
    )
    .output(z.union([z.string(), OVEExceptionSchema]))
    .query(({ ctx, input: { projectId, observatory } }) => {
      logger.info(`Getting controller for ${projectId}`);
      return safe(logger, () =>
        controller.getController(
          ctx.prisma,
          ctx.s3,
          ctx.username,
          projectId,
          observatory,
        ),
      );
    }),
  formatData: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/project/data/format",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        title: z.string(),
        dataType: DataTypesSchema,
        data: z.string(),
        opts: DataFormatConfigOptionsSchema.optional(),
      }),
    )
    .output(
      z.union([
        z.strictObject({
          data: z.string(),
          fileName: z.string(),
        }),
        OVEExceptionSchema,
      ]),
    )
    .mutation(({ input: { title, dataType, data, opts } }) => {
      logger.info(`Formatting data of type ${dataType}`);
      return safe(logger, () =>
        controller.formatData(title, dataType, data, opts),
      );
    }),
  formatDZI: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/project/{bucketName}/file/{objectName}/{versionId}/format/dzi",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        bucketName: z.string(),
        objectName: z.string(),
        versionId: z.string(),
      }),
    )
    .output(z.union([z.undefined(), OVEExceptionSchema]))
    .mutation(({ input: { bucketName, objectName, versionId }, ctx }) => {
      logger.info("Converting image file to DZI");
      return safe(logger, () =>
        controller.formatDZI(ctx.s3, bucketName, objectName, versionId),
      );
    }),
  getCollaborationInvites: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/invites",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.union([InviteSchema.array(), OVEExceptionSchema]))
    .query(({ ctx }) => {
      logger.info(`Getting invites for user ${ctx.username}`);
      return safe(logger, () =>
        controller.getCollaborationInvites(ctx.prisma, ctx.username),
      );
    }),
  getSentInvites: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/invites/sent",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.union([InviteSchema.array(), OVEExceptionSchema]))
    .query(({ ctx }) => {
      logger.info(`Getting invites sent by user ${ctx.username}`);
      return safe(logger, () => controller.getSentInvites(ctx.prisma, ctx.username));
    }),
  acceptInvite: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/invite/accept",
        protect: true,
      },
    })
    .input(z.strictObject({ inviteId: z.string() }))
    .output(z.union([z.any(), OVEExceptionSchema]))
    .mutation(({ input: { inviteId }, ctx }) => {
      logger.info(`Accepting invite ${inviteId}`);
      return safe(logger, () => controller.acceptInvite(ctx.prisma, inviteId));
    }),
  declineInvite: procedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/invite/reject",
        protect: true,
      },
    })
    .input(z.strictObject({ inviteId: z.string() }))
    .output(z.union([z.any(), OVEExceptionSchema]))
    .mutation(({ input: { inviteId }, ctx }) => {
      logger.info(`Declining invite ${inviteId}`);
      return safe(logger, () => controller.declineInvite(ctx.prisma, inviteId));
    }),
  getPendingInviteCount: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/invite/count",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.union([z.number(), OVEExceptionSchema]))
    .query(({ ctx }) => {
      logger.info(`Getting pending invite count for ${ctx.username}`);
      return safe(logger, () =>
        controller.getPendingInviteCount(ctx.prisma, ctx.username),
      );
    }),
});
