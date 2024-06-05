import { z } from "zod";
import { logger } from "../../env";
import { safe } from "@ove/ove-utils";
import controller from "./controller";
import { protectedProcedure, router } from "../trpc";
import { BoundsSchema, OVEExceptionSchema } from "@ove/ove-types";

const ObservatorySchema = z.strictObject({
  name: z.string(),
  isOnline: z.boolean()
});

const ObservatoryBoundsSchema = z.record(z.string(), BoundsSchema);

export const coreRouter = router({
  getObservatories: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/core/observatories",
        protect: true
      }
    })
    .input(z.void())
    .output(z.union([ObservatorySchema.array(), OVEExceptionSchema]))
    .query(async ({ ctx }) => {
      return safe(logger, () => controller.getObservatories(ctx));
    }),
  getObservatoryBounds: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: "/core/observatories/bounds",
        protect: true
      }
    })
    .input(z.void())
    .output(z.union([ObservatoryBoundsSchema, OVEExceptionSchema]))
    .query(async ({ ctx }) => {
      logger.info("Getting observatory bounds");
      return safe(logger, () => controller.getObservatoryBounds(ctx));
    })
});
