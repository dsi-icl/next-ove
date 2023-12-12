import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { safe } from "@ove/ove-utils";
import { logger } from "../../env";
import * as controller from "./controller";
import { OVEExceptionSchema } from "@ove/ove-types";
import { type Project } from "@prisma/client";

const ProjectSchema: z.ZodType<Project> = z.strictObject({
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
  layout: z.strictObject({
    id: z.string(),
    width: z.number(),
    height: z.number(),
    x: z.number(),
    y: z.number(),
    config: z.unknown(),
    asset: z.string(),
    assetId: z.string(),
    dataType: z.string(),
    states: z.string().array(),
    ordering: z.number(),
    projectId: z.string().optional().nullable()
  }).array(),
  tags: z.string().array(),
  isSaved: z.boolean()
})

export const projectsRouter = router({
  getProjects: protectedProcedure
    .meta({method: "GET", path: "/projects", protected: true})
    .input(z.void())
    .output(z.union([OVEExceptionSchema, ProjectSchema.array()]))
    .query(async ({ctx}) => {
      const projects = await safe(logger, () => controller.getProjectsForUser(ctx.prisma, ctx.user));
      ProjectSchema.array().parse(projects);
      return projects;
    })
});
