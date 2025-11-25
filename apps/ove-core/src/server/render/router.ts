import { z } from "zod";
import controller from "./controller";
import { procedure, router } from "../trpc";
import { ProjectSchema, SectionSchema } from "../schemas";

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
    .output(z.undefined())
    .mutation(({ input: { observatory } }) =>
      controller.initObservatory(observatory),
    ),
  clear: procedure
    .meta({ openapi: { path: "/render", method: "DELETE", protect: true } })
    .input(z.strictObject({ observatory: z.string() }))
    .output(z.undefined())
    .mutation(({ input: { observatory } }) =>
      controller.clearObservatory(observatory),
    ),
});
