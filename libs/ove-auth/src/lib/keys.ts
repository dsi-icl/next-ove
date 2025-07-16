import type { PrismaClient } from "@prisma/client";
import type { AuthValidation, Request } from "./utils";
import type { NextFunction, Response } from "express";

const extractKey = (req: Request) => {
  const header = req.headers?.["authorization"];
  if (header === undefined || Array.isArray(header))
    throw new Error("Authorization header is required");
  const match = /^Bearer (.*)$/.exec(header);
  if (match === null || match.length !== 2 || match.at(1) === undefined)
    throw new Error("Bearer authorization required");
  return decodeURIComponent(match[1]);
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

export const apiKeyMiddleware = async (
  prisma: PrismaClient,
  req: Request,
  res: Response,
  next: NextFunction,
  authorize: (role: string, url: string) => boolean,
  credentials: { username: string; role: string; } | undefined = undefined,
) => {
  if (credentials !== undefined) {
    req.username = credentials.username;
    req.role = credentials.role;
    next();
    return;
  }
  if (req.username !== undefined && req.role !== undefined) {
    next();
    return;
  }

  try {
    const key = extractKey(req);
    const authentication = await validateApiKey(prisma, key);

    if (!authorize(authentication.role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.username = authentication.username;
    req.role = authentication.role;
  } catch (_e) {}

  next();
};

export const socketApiKeyMiddleware = async (
  key: string,
  prisma: PrismaClient,
  next: (err?: Error) => void,
  authorize: (role: string) => boolean,
  credentials: { username: string; role: string; } | undefined = undefined,
) => {
  if (credentials !== undefined) {
    next();
    return;
  }
  try {
    const { role } = await validateApiKey(prisma, key);
    if (!authorize(role)) {
      next(new Error("UNAUTHORIZED"));
      return;
    }
    next();
  } catch (_e) {
    next(new Error("UNAUTHORIZED"));
  }
};
