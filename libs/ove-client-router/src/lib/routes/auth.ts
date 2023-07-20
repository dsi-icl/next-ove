import { procedure, router } from "../trpc";
import { z } from "zod";
import { StatusSchema } from "@ove/ove-types";
import { state } from "../state";
import { toAsset } from "@ove/file-utils";

export const authRouter = router({
  register: procedure
    .meta({ openapi: { method: "POST", path: "/edit-device" } })
    .input(z.object({ pin: z.string(), key: z.string() }))
    .output(StatusSchema)
    .mutation(({ input: { pin, key } }) => {
      if (pin === state.pin && !state.authorisedCredentials.includes(key)) {
        state.authorisedCredentials = [key, ...state.authorisedCredentials];
        toAsset("credentials.json", state.authorisedCredentials);
      }
      return pin === state.pin;
    })
});