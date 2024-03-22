import { procedure, protectedProcedure, router } from "../trpc";
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

const UserSchema = z.strictObject({
  id: z.string(),
  username: z.string(),
  email: z.string().nullable(),
  password: z.string(),
  role: z.string(),
  projectIds: z.string().array()
});

export const authRouter = router({
  login: procedure
    .meta({ openapi: { method: "POST", path: "/login" } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.strictObject({
      access: z.string(),
      refresh: z.string(),
      expiry: z.date()
    })]))
    .mutation(async ({ ctx }) => {
      logger.info("Logging in user");
      return safe(() => controller.login(ctx));
    }),
  token: procedure
    .meta({ openapi: { method: "POST", path: "/token" } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.strictObject({
      token: z.string(),
      expiry: z.date()
    })]))
    .mutation(async ({ ctx }) => {
      logger.info("Getting token for user");
      return safe(() => controller.getToken(ctx));
    }),
  getUserID: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/user" } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, UserSchema]))
    .query(async ({ ctx }) => {
      logger.info("Getting user");
      return safe(() => controller.getUser(ctx.prisma, ctx.user));
    })
});
