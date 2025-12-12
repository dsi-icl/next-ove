/* global File, FileList */

import { adminProcedure, router } from "../trpc";
import { logger } from "../../env";
import bcrypt from "bcryptjs";
import { S3Controller } from "../projects/s3-controller";
import { z } from "zod";
import { env } from "../../env";
import { UserSchema } from "../schemas";

const UserFormSchema = z.strictObject({
  name: z.string(),
  username: z.string(),
  email: z.string(),
  password: z.string(),
  role: z.union([z.literal("admin"), z.literal("creator")]),
  icon: z.string().optional(),
});

export const adminRouter = router({
  createUser: adminProcedure
    .meta({
      openapi: {
        method: "POST" as const,
        path: "/admin/user" as const,
        protect: true,
      },
    })
    .input(UserFormSchema)
    .output(z.void())
    .mutation(async ({ input, ctx }) => {
      logger.info("Creating user: ", input.username);
      const hash = bcrypt.hashSync(input.password, env.SALT_ROUNDS);
      let url: string | undefined = undefined;
      if (input.icon !== undefined && env.SERVICES.ASSET_STORE !== undefined) {
        url = `${env.SERVICES.ASSET_STORE.USE_SSL ? "https" : "http"}://${env.SERVICES.ASSET_STORE.END_POINT}:${env.SERVICES.ASSET_STORE.PORT}/${env.SERVICES.ASSET_STORE.USER_BUCKET}/${input.icon}`;
      }
      await ctx.prisma.user.create({
        data: {
          name: input.name,
          username: input.username,
          email: input.email,
          password: hash,
          role: input.role,
          icon: url,
        }
      });
      return undefined;
    }),
  getUserProfileUpload: adminProcedure
    .meta({
      openapi: {
        method: "GET" as const,
        path: "/admin/user/profile" as const,
        protect: true,
      },
    })
    .input(z.strictObject({ filename: z.string() }))
    .output(z.string())
    .query(({ input, ctx }) => {
      logger.info("Getting presigned PUT url for:", input.filename);
      if (ctx.s3 === null || env.SERVICES.ASSET_STORE === undefined) {
        throw new Error("File storage not configured");
      }
      return S3Controller.getPresignedPutURL(ctx.s3, env.SERVICES.ASSET_STORE.USER_BUCKET, input.filename);
    }),
  getUsers: adminProcedure
    .meta({
      openapi: {
        method: "GET" as const,
        path: "/admin/users" as const,
        protect: true,
      },
    })
    .input(z.void())
    .output(UserSchema.array())
    .query(({ ctx }) => {
      logger.info("Getting users");
      return ctx.prisma.user.findMany({
        select: {
          email: true,
          icon: true,
          id: true,
          name: true,
          role: true,
          username: true,
        },
      });
    }),
  getProjectCount: adminProcedure
    .meta({
      openapi: {
        method: "GET" as const,
        path: "/admin/projects/count" as const,
        protect: true,
      },
    })
    .input(z.void())
    .output(z.strictObject({ total: z.number(), change: z.number() }))
    .query(async ({ ctx }) => {
      logger.info("Getting project count");
      const total = await ctx.prisma.project.count({ where: { isDeleted: false } });
      const created = await ctx.prisma.project.count({ where: { created_at: { gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) } } })
      const deleted = await ctx.prisma.project.count({ where: { isDeleted: true, updated_at: { gt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30) } } });
      return { total, change: total === 0 ? 0 : ((created - deleted) / total) * 100 };
    }),
});