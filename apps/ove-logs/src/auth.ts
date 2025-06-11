import type { Request } from "express";
import jwt from "jsonwebtoken";
import { signingKey } from "./app";
import { env } from "./env";
import type { TokenPayload } from "@ove/ove-types";

export const extractCookie = (req: Request) => {
  if (env.AUTH === undefined) throw new Error("Auth not configured");
  const access = req.cookies?.[env.AUTH.COOKIE_ID] as string | undefined;
  if (access === undefined) throw new Error("Missing access token");
  return access;
};

export const validateCookie = (cookie: string) => {
  if (env.AUTH === undefined) throw new Error("Auth not configured");
  if (signingKey === null) throw new Error("Signing key not available");
  const { role } = jwt.verify(cookie, signingKey, {
    algorithms: env.AUTH.JWT_ALGORITHMS,
    audience: env.APP_NAME,
  }) as TokenPayload;
  return { role };
};

export const authorize = (role: string, url: string) => {
  console.log(role, url);
  return true;
};
