import { procedure, router } from "../trpc";
import { z } from "zod";
import * as bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import { env } from "@ove/ove-core-env";

const generateToken = (
  username: string,
  key: string,
  expiresIn?: string
): string => jwt.sign(
  { username },
  key,
  expiresIn !== undefined ? { expiresIn } : undefined
);

export const authRouter = router({
  login: procedure
    .meta({ openapi: { method: "POST", path: "/login" } })
    .input(z.void())
    .output(z.object({ access: z.string(), refresh: z.string() }))
    .mutation(async ({ ctx }) => {
      if (env.ACCESS_TOKEN_SECRET === undefined ||
        env.REFRESH_TOKEN_SECRET === undefined) {
        throw new Error("Authorization not configured");
      }

      if (ctx.user === null) throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No credentials provided"
      });
      const [username, password] = decodeURIComponent(
        Buffer.from(ctx.user, "base64url").toString()).split(":");
      const prisma = new PrismaClient();
      const user = await prisma.auth.findUnique({
        where: {
          username
        }
      });

      if (user === null) throw new TRPCError({
        code: "UNAUTHORIZED",
        message: `No user found with username: ${username}`
      });

      let authorised = false;

      try {
        authorised = await bcrypt.compare(password, user.password);
      } catch (e) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Unknown authorization failure, please contact admin"
        });
      }

      if (!authorised) throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Incorrect password"
      });

      const accessToken = generateToken(username, env.ACCESS_TOKEN_SECRET, "24h");
      const refreshToken = generateToken(username, env.REFRESH_TOKEN_SECRET);

      await prisma.refresh.upsert({
        where: {
          userId: user.id
        },
        create: {
          token: refreshToken,
          userId: user.id
        },
        update: {
          token: refreshToken
        }
      });

      return { access: accessToken, refresh: refreshToken };
    }),
  token: procedure
    .meta({ openapi: { method: "POST", path: "/token" } })
    .input(z.void())
    .output(z.string())
    .mutation(async ({ ctx }) => {
      if (ctx.user === null) throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "No credentials provided"
      });
      const prisma = new PrismaClient();
      const tokenRecord = await prisma.refresh.findUnique({
        where: {
          token: ctx.user
        }
      });

      if (tokenRecord === null) throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Invalid token"
      });

      let user;

      try {
        user = jwt.verify(ctx.user, process.env.REFRESH_TOKEN_SECRET);
      } catch (e) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
      }

      return generateToken(user.username, process.env.ACCESS_TOKEN_SECRET, "24h");
    })
});