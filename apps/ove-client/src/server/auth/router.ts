import {
  OVEExceptionSchema,
  StatusSchema
} from "@ove/ove-types";
import { z } from "zod";
import { logger } from "../../env";
import controller from "./controller";
import { safe } from "@ove/ove-utils";
import { procedure, router } from "../trpc";

export const authRouter = router({
  register: procedure
    .meta({ openapi: { method: "POST", path: "/register" } })
    .input(z.object({ pin: z.string(), key: z.string(), url: z.string() }))
    .output(z.union([OVEExceptionSchema, StatusSchema]))
    .mutation(({ input: { pin, key, url } }) =>
      safe(logger, async () => controller.register(pin, key, url)))
});
