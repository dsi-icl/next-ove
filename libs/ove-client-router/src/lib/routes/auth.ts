import { z } from "zod";
import { state } from "../state";
import { procedure, router } from "../trpc";
import { StatusSchema } from "@ove/ove-types";
import { env, logger } from "@ove/ove-client-env";

export const authRouter = router({
  register: procedure
    .meta({ openapi: { method: "POST", path: "/register" } })
    .input(z.object({ pin: z.string(), key: z.string() }))
    .output(StatusSchema)
    .mutation(({ input: { pin, key } }) => {
      logger.info("/register endpoint hit - authenticating device");
      if (pin === state.pin && !env.AUTHORISED_CREDENTIALS.includes(key)) {
        env.AUTHORISED_CREDENTIALS.push(key);
      }
      return pin === state.pin;
    })
});