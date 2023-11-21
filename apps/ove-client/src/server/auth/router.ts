import { z } from "zod";
import { procedure, router } from "../trpc";
import {
  type OVEException,
  OVEExceptionSchema,
  StatusSchema
} from "@ove/ove-types";
import controller from "./controller";
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
  register: procedure
    .meta({ openapi: { method: "POST", path: "/register" } })
    .input(z.object({ pin: z.string(), key: z.string() }))
    .output(z.union([OVEExceptionSchema, StatusSchema]))
    .mutation(({ input: { pin, key } }) =>
      safe(() => controller.register(pin, key)))
});
