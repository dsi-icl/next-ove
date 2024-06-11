/* global Buffer */

import ms from "ms";
import { env } from "../../env";
import service from "./service";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { TRPCError } from "@trpc/server";
import type { Tokens } from "@ove/ove-types";
import type { PrismaClient } from "@prisma/client";

type RefreshToken = {
  username: string
  tokenId: string
}

const login = async (
  prisma: PrismaClient,
  credentials: string | null
): Promise<Tokens> => {
  if (credentials === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No credentials provided"
    });
  }
  const [username, password] = decodeURIComponent(
    Buffer.from(credentials, "base64url").toString()).split(":");
  const user = await prisma.user.findUnique({
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
    username, env.TOKENS.ACCESS.SECRET, env.TOKENS.ACCESS.ISSUER,
    env.TOKENS.ACCESS.EXPIRY, env.TOKENS.ACCESS.ISSUER);
  const refreshToken = service.generateToken(username,
    env.TOKENS.REFRESH.SECRET, env.TOKENS.REFRESH.ISSUER,
    undefined, env.TOKENS.REFRESH.ISSUER);

  await prisma.refreshToken.upsert({
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

const getToken = async (prisma: PrismaClient, credentials: string | null) => {
  if (credentials === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No credentials provided"
    });
  }
  const tokenRecord = await prisma.refreshToken.findUnique({
    where: {
      token: credentials
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
    user = jwt.verify(credentials, env.TOKENS.REFRESH.SECRET, {
      issuer: env.TOKENS.REFRESH.ISSUER,
      audience: env.TOKENS.REFRESH.ISSUER
    }) as RefreshToken;
  } catch (e) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }

  return {
    token: service.generateToken(user.username, env.TOKENS.ACCESS.SECRET,
      env.TOKENS.ACCESS.ISSUER, env.TOKENS.ACCESS.EXPIRY,
      env.TOKENS.ACCESS.ISSUER),
    expiry: new Date(Date.now() + ms(env.TOKENS.ACCESS.EXPIRY))
  };
};

const logout = async (prisma: PrismaClient, username: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { username } });
  await prisma.refreshToken.delete({ where: { userId: user.id } });
};

const getUser = (prisma: PrismaClient, username: string) =>
  prisma.user.findUniqueOrThrow({ where: { username } });

const controller = { login, getToken, getUser, logout };

export default controller;
