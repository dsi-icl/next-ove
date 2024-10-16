import { z } from "zod";
import { logger } from "../../env";
import { safe } from "@ove/ove-utils";
import { controller } from "./controller";
import { protectedProcedure, router } from "../trpc";
import type { Project, Section } from "@prisma/client";
import { type OVEException, OVEExceptionSchema } from "@ove/ove-types";

export type Controller = {
  initObservatory: (observatory: string, project: Project, layout: Section[]) => Promise<void | OVEException>
  clearObservatory: (observatory: string) => Promise<void | OVEException>
}

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

export const renderRouter = router({
  init: protectedProcedure
    .meta({ openapi: { path: "/render", method: "POST", protect: true } })
    .input(z.strictObject({
      observatory: z.string(),
      project: ProjectSchema,
      layout: SectionSchema.array()
    }))
    .output(z.union([z.void(), OVEExceptionSchema]))
    .mutation(async ({ input: { observatory, project, layout } }) => {
      logger.info(`Initialising render on ${observatory}`);
      return await safe(logger, async () =>
        controller.initObservatory(observatory, {
          ...project,
          created: new Date(project.created),
          updated: new Date(project.updated)
        }, layout));
    }),
  clear: protectedProcedure
    .meta({ openapi: { path: "/render", method: "DELETE", protect: true } })
    .input(z.strictObject({ observatory: z.string() }))
    .output(z.union([z.void(), OVEExceptionSchema]))
    .mutation(({ input: { observatory } }) => {
      logger.info(`Clearing render on ${observatory}`);
      return safe(logger, async () =>
        controller.clearObservatory(observatory));
    })
});
