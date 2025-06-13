/* global console, Buffer */

import { env } from "../env";
import { nanoid } from "nanoid";
import { state } from "./state";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import type { Request, Response } from "express";
import type { TokenPayload } from "@ove/ove-types";
import type { PrismaClient } from "@prisma/client";

const conditionalPut = <T extends object, Key extends keyof T>(
  k: Key,
  obj: T[Key] | undefined,
  acc: T,
): T =>
  obj === undefined
    ? acc
    : {
        ...acc,
        [k]: obj,
      };

const generateToken = (
  payload: TokenPayload,
  secret: { key: string; passphrase: string },
  issuer: string,
  algorithm: jwt.Algorithm,
  expiresIn: string | undefined,
  audience: string[] | undefined,
): string =>
  jwt.sign(
    { ...payload, tokenId: nanoid(16) },
    secret,
    conditionalPut(
      "audience",
      audience,
      conditionalPut(
        "expiresIn",
        expiresIn as jwt.SignOptions["expiresIn"],
        {
          issuer,
          algorithm,
        } as jwt.SignOptions,
      ),
    ),
  );

export type AuthValidation = { username: string; role: string };

const extractCookies = (req: Request) => {
  const cookies = req.cookies;
  const access = cookies?.[env.TOKENS.ACCESS.COOKIE.ID] as string | undefined;
  let refresh: string | undefined = undefined;
  if (
    env.TOKENS.REFRESH.COOKIE.ID in cookies &&
    cookies[env.TOKENS.REFRESH.COOKIE.ID] !== undefined
  ) {
    refresh = cookies[env.TOKENS.REFRESH.COOKIE.ID] as string;
  }

  return [access, refresh] as const;
};

const extractKey = (req: Request) => {
  const header = req.headers?.["authorization"];
  if (header === undefined || Array.isArray(header))
    throw new Error("Authorization header is required");
  const match = /^Bearer (.*)$/.exec(header);
  if (match === null || match.length !== 2 || match.at(1) === undefined)
    throw new Error("Bearer authorization required");
  return decodeURIComponent(match[1]);
};

const extractCredentials = (req: Request) => {
  const header = req.headers?.["authorization"];
  if (header === undefined || Array.isArray(header))
    throw new Error("Authorization header is required");
  const match = /^Basic (.*)$/.exec(header);
  if (match === null || match.length !== 2 || match.at(1) === undefined)
    throw new Error("Basic authorization required");
  return Buffer.from(decodeURIComponent(match[1]), "base64url")
    .toString()
    .split(":") as [string, string];
};

const extractOTP = (req: Request) => {
  const otp = req.query?.["otp"];

  if (otp === null || otp === undefined || typeof otp !== "string")
    throw new Error("Missing OTP query parameter");
  return otp;
};

const validatePassword = async (
  prisma: PrismaClient,
  [username, password]: [string, string],
): Promise<AuthValidation> => {
  const user = await prisma.user.findUniqueOrThrow({
    where: {
      username,
    },
    select: {
      password: true,
      role: true,
    },
  });

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid password");
  return { username, role: user.role };
};

const validateApiKey = async (
  prisma: PrismaClient,
  key: string,
): Promise<AuthValidation> => {
  const service = await prisma.service.findFirstOrThrow({
    where: {
      key,
    },
    select: {
      role: true,
      service: true,
    },
  });
  return { username: service.service, role: service.role };
};

const validateCookies = async (
  res: Response,
  prisma: PrismaClient,
  access: string | undefined,
  refresh: string | undefined,
): Promise<AuthValidation> => {
  if (env.ENVIRONMENT === "test") {
    return { username: env.TESTING.TEST_USER, role: "test" };
  }

  let username: string;

  if (
    access !== undefined &&
    (await prisma.tokenBlacklist.findUnique({
      where: {
        token: access,
      },
    })) !== null
  ) {
    throw new Error("Token is blacklisted");
  }

  try {
    username = (
      jwt.verify(access ?? "ERROR", env.TOKENS.SIGNING_KEYS.PUBLIC, {
        issuer: env.TOKENS.ACCESS.ISSUER,
        audience: env.TOKENS.ACCESS.AUDIENCE,
        algorithms: ["RS256"],
      }) as unknown as { username: string }
    ).username;
  } catch (e) {
    if (refresh === undefined) throw e;
    const refreshRecord = await prisma.refreshToken.findUniqueOrThrow({
      where: {
        token: refresh,
      },
      include: {
        user: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });
    username = refreshRecord.user.username;
    generateAccessCookie(res, refreshRecord.user);
  }

  let role: string;

  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    select: {
      username: true,
      role: true,
    },
  });

  if (user === null) {
    const service = await prisma.service.findUniqueOrThrow({
      where: {
        service: username,
      },
      select: {
        role: true,
      },
    });
    role = service.role;
  } else {
    role = user.role;
  }

  return { username, role };
};

const validateOTP = async (otp: string): Promise<AuthValidation> => {
  if (!state.otps.has(otp)) throw new Error("OTP revoked");
  return jwt.verify(otp, env.TOKENS.SIGNING_KEYS.PUBLIC, {
    issuer: env.TOKENS.OTP.ISSUER,
    audience: env.TOKENS.OTP.AUDIENCE,
    algorithms: [env.TOKENS.OTP.ALGORITHM],
  }) as { username: string; role: string };
};

const generateAccessCookie = (res: Response, payload: TokenPayload) => {
  const accessToken = generateAccessToken(payload);

  res.cookie(env.TOKENS.ACCESS.COOKIE.ID, accessToken, {
    maxAge: 5 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
    domain: env.TOKENS.ACCESS.COOKIE.DOMAIN,
  });
};

const generateAccessToken = (payload: TokenPayload) =>
  generateToken(
    payload,
    {
      key: env.TOKENS.SIGNING_KEYS.PRIVATE,
      passphrase: env.TOKENS.SIGNING_KEYS.PASSPHRASE,
    },
    env.TOKENS.ACCESS.ISSUER,
    env.TOKENS.ACCESS.ALGORITHM,
    env.TOKENS.ACCESS.EXPIRY,
    env.TOKENS.ACCESS.AUDIENCE,
  );

const generateRefreshCookie = async (
  res: Response,
  prisma: PrismaClient,
  payload: TokenPayload,
) => {
  let id;
  const user = await prisma.user.findUnique({
    where: {
      username: payload.username,
    },
    select: {
      id: true,
      username: true,
    },
  });

  if (user === null) {
    const service = await prisma.service.findUniqueOrThrow({
      where: {
        service: payload.username,
      },
    });
    id = service.id;
  } else {
    id = user.id;
  }

  const refreshToken = generateToken(
    payload,
    {
      key: env.TOKENS.SIGNING_KEYS.PRIVATE,
      passphrase: env.TOKENS.SIGNING_KEYS.PASSPHRASE,
    },
    env.TOKENS.REFRESH.ISSUER,
    env.TOKENS.REFRESH.ALGORITHM,
    undefined,
    [env.TOKENS.REFRESH.ISSUER],
  );

  await prisma.refreshToken.upsert({
    where: {
      userId: id,
    },
    create: {
      token: refreshToken,
      userId: id,
    },
    update: {
      token: refreshToken,
    },
  });

  res.cookie(env.TOKENS.REFRESH.COOKIE.ID, refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    domain: env.TOKENS.REFRESH.COOKIE.DOMAIN,
  });
};

const generateOTP = (payload: TokenPayload) =>
  generateToken(
    payload,
    {
      key: env.TOKENS.SIGNING_KEYS.PRIVATE,
      passphrase: env.TOKENS.SIGNING_KEYS.PASSPHRASE,
    },
    env.TOKENS.OTP.ISSUER,
    env.TOKENS.OTP.ALGORITHM,
    env.TOKENS.OTP.EXPIRY,
    env.TOKENS.OTP.AUDIENCE,
  );

const authorize = (role: string, url: string) => {
  console.log(role, url);
  return true;
};

const logout = async (
  res: Response,
  prisma: PrismaClient,
  username: string,
) => {
  res.clearCookie(env.TOKENS.ACCESS.COOKIE.ID);
  res.clearCookie(env.TOKENS.REFRESH.COOKIE.ID);
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true },
  });
  if (user === null) return;
  await prisma.refreshToken.delete({
    where: {
      userId: user.id,
    },
  });
};

const service = {
  extractCookies,
  extractKey,
  extractCredentials,
  extractOTP,
  validatePassword,
  validateApiKey,
  validateCookies,
  validateOTP,
  authorize,
  generateAccessToken,
  generateAccessCookie,
  generateRefreshCookie,
  generateOTP,
  logout,
};

export default service;
