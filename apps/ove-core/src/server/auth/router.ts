import { z } from "zod";
import { logger } from "../../env";
import { safe } from "@ove/ove-utils";
import controller from "./controller";
import { procedure, protectedProcedure, router } from "../trpc";
import { OVEExceptionSchema } from "@ove/ove-types";

const UserSchema = z.strictObject({
  id: z.string(),
  username: z.string(),
  email: z.string().nullable(),
  role: z.string(),
  icon: z.string().nullable(),
  name: z.string().nullable(),
});

export const authRouter = router({
  login: procedure
    .meta({ openapi: { method: "POST", path: "/login" } })
    .input(z.strictObject({}))
    .output(
      z.union([
        OVEExceptionSchema,
        z.strictObject({
          access: z.string(),
          refresh: z.string(),
          expiry: z.date(),
        }),
      ]),
    )
    .mutation(async ({ ctx }) => {
      logger.info("Logging in user");
      return safe(logger, () => controller.login(ctx.prisma, ctx.user));
    }),
  logout: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/logout" } })
    .input(z.strictObject({}))
    .output(z.union([OVEExceptionSchema, z.undefined()]))
    .mutation(async ({ ctx }) => {
      logger.info("Logging out user");
      return safe(logger, () => controller.logout(ctx.prisma, ctx.user));
    }),
  token: procedure
    .meta({ openapi: { method: "GET", path: "/token" } })
    .input(z.strictObject({}))
    .output(
      z.union([
        OVEExceptionSchema,
        z.strictObject({
          token: z.string(),
          expiry: z.date(),
        }),
      ]),
    )
    .query(async ({ ctx }) => {
      logger.info("Getting token for user");
      return safe(logger, () => controller.getToken(ctx.prisma, ctx.user));
    }),
  getUserID: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/user" } })
    .input(z.strictObject({}))
    .output(z.union([OVEExceptionSchema, UserSchema]))
    .query(async ({ ctx }) => {
      logger.info("Getting user");
      return safe(logger, () => controller.getUser(ctx.prisma, ctx.user));
    }),
  getLoggingToken: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/logs/token" } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.string()]))
    .query(async () => {
      logger.info("Getting token for logging service");
      return safe(logger, controller.getLoggingToken);
    }),
});
