import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { safe } from "@ove/ove-utils";
import { logger } from "../../env";
import controller from "./controller";
import { FileSchema, OVEExceptionSchema } from "@ove/ove-types";
import {
  PrismaClient,
  type Invite,
  type Project,
  type Section,
  type User
} from "@prisma/client";
import { type JsonValue } from "@prisma/client/runtime/library";

const SectionSchema: z.ZodType<Section> = z.strictObject({
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

const ProjectSchema: z.ZodType<Project & {
  layout: Section[]
}> = z.strictObject({
  id: z.string(),
  creatorId: z.string(),
  collaboratorIds: z.string().array(),
  created: z.date(),
  updated: z.date(),
  layout: SectionSchema.array(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string().nullable(),
  publications: z.string().array(),
  presenterNotes: z.string(),
  notes: z.string(),
  tags: z.string().array(),
  isSaved: z.boolean()
});

const UserSchema: z.ZodType<User> = z.strictObject({
  id: z.string(),
  username: z.string(),
  password: z.string(),
  email: z.string().nullable(),
  role: z.string(),
  projectIds: z.string().array()
});

const InviteSchema: z.ZodType<Invite> = z.strictObject({
  id: z.string(),
  sent: z.date(),
  status: z.string(),
  projectId: z.string(),
  senderId: z.string(),
  recipientId: z.string()
});

export type Controller = {
  getProjectsForUser: (prisma: PrismaClient, user: string) =>
    Promise<(Project & { layout: Section[] })[]>
  getProject: (prisma: PrismaClient, user: string, id: string) =>
    Promise<(Project & { layout: Section[] }) | null>
  getTagsForUser: (prisma: PrismaClient, user: string) =>
    Promise<string[]>
  getUsers: (prisma: PrismaClient) => Promise<User[]>
  getInvitesForProject: (prisma: PrismaClient, projectId: string) =>
    Promise<Invite[]>
  getFiles: (projectId: string) => Promise<z.infer<typeof FileSchema>[]>
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
      path: "/project/{projectId}/invites",
      protected: true
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([InviteSchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx, input: { projectId } }) => {
      logger.info(`Getting invites for ${projectId}`);
      return await safe(logger, () =>
        controller.getInvitesForProject(ctx.prisma, projectId));
    }),
  getFiles: protectedProcedure
    .meta({
      method: "GET",
      path: "/project/{projectId}/files",
      protected: true
    })
    .input(z.strictObject({ projectId: z.string() }))
    .output(z.union([FileSchema.array(), OVEExceptionSchema]))
    .query(async ({ input: { projectId } }) => {
      logger.info(`Getting files for ${projectId}`);
      return await safe(logger, () => controller.getFiles(projectId));
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
    })
});
