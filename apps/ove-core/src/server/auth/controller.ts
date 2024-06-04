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

type RefreshToken = {
  username: string
  tokenId: string
}

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
    username, env.TOKENS.ACCESS.SECRET, env.TOKENS.ACCESS.ISSUER, env.TOKENS.ACCESS.EXPIRY, env.TOKENS.ACCESS.ISSUER);
  const refreshToken = service.generateToken(username, env.TOKENS.REFRESH.SECRET, env.TOKENS.REFRESH.ISSUER, undefined, env.TOKENS.REFRESH.ISSUER);

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
    expiry: new Date(Date.now() + ms(env.TOKENS.ACCESS.EXPIRY))
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

  let user: RefreshToken;

  try {
    user = jwt.verify(ctx.user, env.TOKENS.REFRESH.SECRET, {
      issuer: env.TOKENS.REFRESH.ISSUER,
      audience: env.TOKENS.REFRESH.ISSUER
    }) as RefreshToken;
  } catch (e) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }

  return {
    token: service.generateToken(
      user.username, env.TOKENS.ACCESS.SECRET, env.TOKENS.ACCESS.ISSUER, env.TOKENS.ACCESS.EXPIRY, env.TOKENS.ACCESS.ISSUER),
    expiry: new Date(Date.now() + ms(env.TOKENS.ACCESS.EXPIRY))
  };
};

const getUser = (prisma: PrismaClient, username: string) =>
  prisma.user.findUniqueOrThrow({ where: { username } });

const controller = { login, getToken, getUser };

export default controller;
