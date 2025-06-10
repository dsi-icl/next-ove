import { z } from "zod";
import { logger } from "../../env";
import { safe } from "@ove/ove-utils";
import controller from "./controller";
import { procedure, router } from "../trpc";
import { OVEExceptionSchema } from "@ove/ove-types";

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
  isPublic: z.boolean(),
  bucket: z.string().nullable(),
});

export const renderRouter = router({
  init: procedure
    .meta({ openapi: { path: "/render", method: "POST", protect: true } })
    .input(
      z.strictObject({
        observatory: z.string(),
        project: ProjectSchema,
        layout: SectionSchema.array(),
      }),
    )
    .output(z.union([z.undefined(), OVEExceptionSchema]))
    .mutation(async ({ input: { observatory, project, layout } }) => {
      logger.info(`Initialising render on ${observatory}`);
      return await safe(logger, async () =>
        controller.initObservatory(
          observatory,
          {
            ...project,
            created: new Date(project.created),
            updated: new Date(project.updated),
          },
          layout,
        ),
      );
    }),
  clear: procedure
    .meta({ openapi: { path: "/render", method: "DELETE", protect: true } })
    .input(z.strictObject({ observatory: z.string() }))
    .output(z.union([z.undefined(), OVEExceptionSchema]))
    .mutation(({ input: { observatory } }) => {
      logger.info(`Clearing render on ${observatory}`);
      return safe(logger, async () => controller.clearObservatory(observatory));
    }),
});
