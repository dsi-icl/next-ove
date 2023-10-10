import { procedure, router } from "../trpc";
import { z } from "zod";
import controller from "./controller";
import { type OVEException, OVEExceptionSchema } from "@ove/ove-types";
import { logger } from "../../env";

const safe = async <T>(handler: () => T): Promise<T | OVEException> => {
  try {
    return handler();
  } catch (e) {
    logger.error(e);
    return { oveError: (e as Error).message };
  }
};

export const authRouter = router({
  login: procedure
    .meta({ openapi: { method: "POST", path: "/login" } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.object({ access: z.string(), refresh: z.string() })]))
    .mutation(async ({ ctx }) => safe(() => controller.login(ctx))),
  token: procedure
    .meta({ openapi: { method: "POST", path: "/token" } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.string()]))
    .mutation(async ({ ctx }) => safe(() => controller.getToken(ctx)))
});