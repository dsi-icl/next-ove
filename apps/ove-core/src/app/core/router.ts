import { protectedProcedure, router } from "../trpc";
import { z } from "zod";
import { safe } from "@ove/ove-utils";
import { logger } from "../../env";
import controller from "./controller";
import { OVEExceptionSchema } from "@ove/ove-types";

export const coreRouter = router({
  getObservatories: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/bridges", protect: true } })
    .input(z.void())
    .output(z.union([z.array(z.object({ name: z.string(), isOnline: z.boolean() })), OVEExceptionSchema]))
    .query(async ({ctx}) => safe(logger, () => controller.getObservatories(ctx)))
});