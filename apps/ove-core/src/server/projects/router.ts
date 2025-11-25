import { z } from "zod";
import controller from "./controller";
import {
  CollaboratorSchema,
  DataFormatConfigOptionsSchema,
  InviteSchema,
  ProjectSchema,
  ProjectSchemaOutput,
  SectionSchema,
  UserSchema,
} from "../schemas";
import { procedure, router } from "../trpc";
import { DataTypesSchema, FileSchema } from "@ove/ove-types";

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
    .output(SectionSchema.array())
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
          created: true,
          updated: true,
          bucket: true,
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
      z.strictObject({
        project: ProjectSchemaOutput,
        layout: SectionSchema.array(),
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
        layout: SectionSchema.array(),
      }),
    )
    .mutation(({ ctx, input }) =>
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
    .output(z.string())
    .query(({ ctx, input }) =>
      controller.getPresignedGetURL(
        ctx.s3,
        input.bucketName,
        input.objectName,
        input.versionId,
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
      controller.generateThumbnail(ctx.prisma, input.projectId, input.tags),
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
    .output(SectionSchema.array())
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
      z.strictObject({
        data: z.string(),
        fileName: z.string(),
      }),
    )
    .mutation(({ input: { title, dataType, data, opts } }) =>
      controller.formatData(title, dataType, data, opts),
    ),
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
    .output(z.undefined())
    .mutation(({ input: { bucketName, objectName, versionId }, ctx }) =>
      controller.formatDZI(ctx.s3, bucketName, objectName, versionId),
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
