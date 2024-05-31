/* global Buffer */

import ms from "ms";
import { env } from "../../env";
import service from "./service";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import type { Context } from "../context";
import type { Tokens } from "@ove/ove-types";
import type { PrismaClient } from "@prisma/client";

const login = async (ctx: Context): Promise<Tokens> => {
  if (ctx.user === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No credentials provided"
    });
  }
  const [username, password] = decodeURIComponent(
    Buffer.from(ctx.user, "base64url").toString()).split(":");
  const user = await ctx.prisma.user.findUnique({
    where: {
      username
    }
  });

  if (user === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: `No user found with username: ${username}`
    });
  }

  let authorised = false;

  try {
    authorised = await bcrypt.compare(password, user.password);
  } catch (e) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unknown authorization failure, please contact admin"
    });
  }

  if (!authorised) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Incorrect password"
    });
  }

  const accessToken = service.generateToken(
    username, env.ACCESS_TOKEN_SECRET, env.TOKEN_EXPIRY);
  const refreshToken = service.generateToken(username, env.REFRESH_TOKEN_SECRET);

  await ctx.prisma.refreshToken.upsert({
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

  return {
    access: accessToken,
    refresh: refreshToken,
    expiry: new Date(Date.now() + ms(env.TOKEN_EXPIRY))
  };
};

const getToken = async (ctx: Context) => {
  if (ctx.user === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No credentials provided"
    });
  }
  const tokenRecord = await ctx.prisma.refreshToken.findUnique({
    where: {
      token: ctx.user
    }
  });

  if (tokenRecord === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token"
    });
  }

  let user: { username: string };

  try {
    user = jwt.verify(ctx.user, env.REFRESH_TOKEN_SECRET) as {
      username: string
    };
  } catch (e) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }

  return {
    token: service.generateToken(
      user.username, env.ACCESS_TOKEN_SECRET, env.TOKEN_EXPIRY),
    expiry: new Date(Date.now() + ms(env.TOKEN_EXPIRY))
  };
};

const getUser = (prisma: PrismaClient, username: string) =>
  prisma.user.findUniqueOrThrow({ where: { username } });

const controller = { login, getToken, getUser };

export default controller;
