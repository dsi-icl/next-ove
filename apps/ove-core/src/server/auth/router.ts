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
      return safe(logger, () => controller.login(ctx.prisma, ctx.user));
    }),
  logout: protectedProcedure
    .meta({ openapi: { method: "DELETE", path: "/logout" } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.void()]))
    .mutation(async ({ ctx }) => {
      logger.info("Logging out user");
      return safe(logger, () => controller.logout(ctx.prisma, ctx.user));
    }),
  token: procedure
    .meta({ openapi: { method: "GET", path: "/token" } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, z.strictObject({
      token: z.string(),
      expiry: z.date()
    })]))
    .query(async ({ ctx }) => {
      logger.info("Getting token for user");
      return safe(logger, () => controller.getToken(ctx.prisma, ctx.user));
    }),
  getUserID: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/user" } })
    .input(z.void())
    .output(z.union([OVEExceptionSchema, UserSchema]))
    .query(async ({ ctx }) => {
      logger.info("Getting user");
      return safe(logger, () => controller.getUser(ctx.prisma, ctx.user));
    })
});
