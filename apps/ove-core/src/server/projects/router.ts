import { z } from "zod";
import controller from "./controller";
import {
  CollaboratorSchema,
  InviteSchema,
  ProjectSchema,
  ProjectSchemaOutput,
  SectionSchema,
  SectionSchemaOutput,
  UserSchema,
} from "../schemas";
import { procedure, router } from "../trpc";
import { FileSchema } from "@ove/ove-types";
import { logger } from "../../env";

export const projectsRouter = router({
  getProjects: procedure
    .meta({ openapi: { method: "GET", path: "/projects", protect: true } })
    .input(z.void())
    .output(ProjectSchemaOutput.array())
    .query(({ ctx }) =>
      controller.getProjectsForUser(ctx.prisma, ctx.username),
    ),
  getProject: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(ProjectSchemaOutput.nullable())
    .query(({ ctx, input: { projectId } }) =>
      controller.getProject(ctx.prisma, ctx.username, projectId),
    ),
  getTags: procedure
    .meta({ openapi: { method: "GET", path: "/projects/tags", protect: true } })
    .input(z.void())
    .output(z.string().array())
    .query(({ ctx }) => controller.getTags(ctx.prisma)),
  getPublications: procedure
    .meta({
      openapi: { method: "GET", path: "/projects/publications", protect: true },
    })
    .input(z.void())
    .output(z.string().array())
    .query(({ ctx }) => controller.getPublications(ctx.prisma)),
  getUsers: procedure
    .meta({ openapi: { method: "GET", path: "/users", protect: true } })
    .input(z.void())
    .output(UserSchema.array())
    .query(({ ctx }) => controller.getUsers(ctx.prisma)),
  getCollaboratorsForProject: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/collaborators",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(CollaboratorSchema.array())
    .query(({ ctx, input: { projectId } }) =>
      controller.getCollaboratorsForProject(ctx.prisma, projectId),
    ),
  getSectionsForProject: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/sections",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(SectionSchemaOutput.array())
    .query(({ ctx, input: { projectId } }) =>
      controller.getSectionsForProject(ctx.prisma, projectId),
    ),
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
          created_at: true,
          updated_at: true,
          bucket: true,
        }).optional(),
        layout: SectionSchema.omit({
          id: true,
          projectId: true,
          updated_at: true,
          created_at: true,
        })
          .array()
          .optional(),
        files: z.string().array().optional(),
      }),
    )
    .output(
      z.strictObject({
        project: ProjectSchemaOutput,
        layout: SectionSchemaOutput.array(),
        files: z.string().array().optional(),
      }),
    )
    .mutation(({ ctx, input: { files, project, layout } }) =>
      controller.createProject(
        ctx.prisma,
        ctx.s3,
        ctx.username,
        project,
        layout,
        files,
      ),
    ),
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
      z.strictObject({
        project: ProjectSchemaOutput,
        layout: SectionSchemaOutput.array(),
      }),
    )
    .mutation(({ ctx, input }) =>
      controller.saveProject(
        ctx.prisma,
        ctx.username,
        {
          ...input.project,
          created_at: new Date(input.project.created_at),
          updated_at: new Date(input.project.updated_at),
        },
        input.layout,
      ),
    ),
  getFiles: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/files",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(FileSchema.array())
    .query(({ ctx, input: { projectId } }) =>
      controller.getFiles(ctx.prisma, ctx.s3, ctx.username, projectId),
    ),
  getConversionStatus: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{bucketName}/file/{objectName}/{versionId}/conversion/status",
        protect: true,
      },
    })
    .input(z.strictObject({
      bucketName: z.string(),
      objectName: z.string(),
      versionId: z.string(),
    }))
    .output(z.boolean())
    .query(({ ctx, input }) => {
      logger.info(`Getting conversion status for ${input.objectName}`);
      return controller.getConversionStatus(ctx.s3, input.bucketName, input.objectName, input.versionId);
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
        isThumbnail: z.boolean().optional(),
      }),
    )
    .output(z.string())
    .query(({ ctx, input }) =>
      controller.getPresignedGetURL(
        ctx.s3,
        input.bucketName,
        input.objectName,
        input.versionId,
        input.isThumbnail ?? false,
      ),
    ),
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
    .output(z.string())
    .query(({ ctx, input }) =>
      controller.getPresignedPutURL(
        ctx.prisma,
        ctx.s3,
        ctx.username,
        input.projectId,
        input.objectName,
      ),
    ),
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
    .output(z.string())
    .mutation(({ ctx, input }) =>
      controller.generateThumbnail(
        ctx.prisma,
        ctx.s3,
        input.projectId,
        input.tags,
      ),
    ),
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
    .output(z.undefined())
    .mutation(({ ctx, input }) =>
      controller.inviteCollaborator(
        ctx.prisma,
        input.projectId,
        ctx.username,
        input.collaboratorId,
      ),
    ),
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
    .output(z.undefined())
    .mutation(({ ctx, input }) =>
      controller.removeCollaborator(
        ctx.prisma,
        input.projectId,
        input.collaboratorId,
      ),
    ),
  getLayout: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/layout",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(SectionSchemaOutput.array())
    .query(({ ctx, input: { projectId } }) =>
      controller.getLayout(ctx.prisma, projectId),
    ),
  getEnv: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/project/{projectId}/env",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.custom())
    .query(({ ctx, input: { projectId } }) =>
      controller.getEnv(ctx.prisma, ctx.s3, ctx.username, projectId),
    ),
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
        layout: z.string().optional(),
        observatory: z.string(),
      }),
    )
    .output(z.string())
    .query(({ ctx, input: { projectId, observatory, layout } }) =>
      controller.getController(
        ctx.prisma,
        ctx.s3,
        ctx.username,
        projectId,
        observatory,
        layout,
      ),
    ),
  getCollaborationInvites: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/invites",
        protect: true,
      },
    })
    .input(z.void())
    .output(InviteSchema.array())
    .query(({ ctx }) =>
      controller.getCollaborationInvites(ctx.prisma, ctx.username),
    ),
  getSentInvites: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/invites/sent",
        protect: true,
      },
    })
    .input(z.void())
    .output(InviteSchema.array())
    .query(({ ctx }) => controller.getSentInvites(ctx.prisma, ctx.username)),
  acceptInvite: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/invite/accept",
        protect: true,
      },
    })
    .input(z.strictObject({ inviteId: z.string() }))
    .output(z.any())
    .mutation(({ input: { inviteId }, ctx }) =>
      controller.acceptInvite(ctx.prisma, inviteId),
    ),
  declineInvite: procedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/invite/reject",
        protect: true,
      },
    })
    .input(z.strictObject({ inviteId: z.string() }))
    .output(z.any())
    .mutation(({ input: { inviteId }, ctx }) =>
      controller.declineInvite(ctx.prisma, inviteId),
    ),
  recordProjectLaunch: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/launch",
        protect: true,
      },
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.any())
    .mutation(({ input: { projectId }, ctx }) =>
      controller.recordProjectLaunch(ctx.prisma, projectId),
    ),
  getPendingInviteCount: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/invite/count",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.number())
    .query(({ ctx }) =>
      controller.getPendingInviteCount(ctx.prisma, ctx.username),
    ),
});
