import { z } from "zod";
import { logger } from "../../env";
import controller from "./controller";
import { procedure, router } from "../trpc";
import { BoundsSchema } from "@ove/ove-types";

const ObservatorySchema = z.strictObject({
  name: z.string(),
  isOnline: z.boolean(),
});

const ObservatoryBoundsSchema = z.record(z.string(), BoundsSchema);

export const coreRouter = router({
  getObservatories: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/core/observatories",
        protect: true,
      },
    })
    .input(z.void())
    .output(ObservatorySchema.array())
    .query(async ({ ctx }) => {
      logger.info("Getting observatories");
      return controller.getObservatories(ctx);
    }),
  getObservatoryBounds: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/core/observatories/bounds",
        protect: true,
      },
    })
    .input(z.void())
    .output(ObservatoryBoundsSchema)
    .query(async ({ ctx }) => {
      logger.info("Getting observatory bounds");
      return controller.getObservatoryBounds(ctx);
    }),
  getRenderer: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/core/renderer",
        protect: true,
      },
    })
    .input(z.void())
    .output(z.string().nullable())
    .query(async () => {
      logger.info("Getting renderer");
      return controller.getRenderer();
    }),
});
