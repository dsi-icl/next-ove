import type { PrismaClient } from "@prisma/client";
import type { AuthValidation, Request } from "./utils";
import type { NextFunction, Response } from "express";
import * as bcrypt from "bcrypt";

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

export const credentialsMiddleware = async (
  prisma: PrismaClient,
  req: Request,
  res: Response,
  next: NextFunction,
  authorize: (role: string, url: string) => boolean,
  credentials: { username: string; role: string } | undefined = undefined,
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
    const credentials = extractCredentials(req);
    const { username, role } = await validatePassword(prisma, credentials);

    if (!authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.username = username;
    req.role = role;
  } catch (_e) {}

  next();
};
