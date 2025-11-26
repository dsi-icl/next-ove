import { StatusSchema } from "@ove/ove-types";
import { z } from "zod";
import controller from "./controller";
import { procedure, router } from "../trpc";

export const authRouter = router({
  register: procedure
    .meta({ openapi: { method: "POST", path: "/register" } })
    .input(z.strictObject({ pin: z.string(), key: z.string() }))
    .output(StatusSchema)
    .mutation(({ input: { pin, key } }) => controller.register(pin, key)),
});
