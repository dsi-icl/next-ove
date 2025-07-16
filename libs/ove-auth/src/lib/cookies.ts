import type { NextFunction, Response } from "express";
import type { TokenPayload } from "@ove/ove-types";
import type { PrismaClient } from ".prisma/client";
import { generateToken } from "./tokens";
import * as jwt from "jsonwebtoken";
import { Algorithm } from "jsonwebtoken";
import type { AuthValidation, Request } from "./utils";

type AccessCookieConfig = {
  SIGNING_KEYS: {
    PRIVATE: string;
    PASSPHRASE: string;
    PUBLIC: string;
  };
  ACCESS: {
    ISSUER: string;
    ALGORITHM: Algorithm;
    EXPIRY: string;
    AUDIENCE: string[];
    COOKIE: {
      ID: string;
      DOMAIN: string;
    };
  };
};

type ThirdPartyCookieConfig = {
  signingKey: string | null;
  algorithm: Algorithm | undefined;
  audience: string | undefined;
  cookieId: string;
};

type RefreshCookieConfig = {
  SIGNING_KEYS: {
    PRIVATE: string;
    PASSPHRASE: string;
  };
  REFRESH: {
    ISSUER: string;
    ALGORITHM: Algorithm;
    COOKIE: {
      ID: string;
      DOMAIN: string;
    };
  };
};

export const extractCookies = (
  req: Request,
  accessCookieId: string,
  refreshCookieId: string,
) => {
  const cookies = req.cookies;
  const access = cookies?.[accessCookieId] as string | undefined;
  let refresh: string | undefined = undefined;
  if (refreshCookieId in cookies && cookies[refreshCookieId] !== undefined) {
    refresh = cookies[refreshCookieId] as string;
  }

  return [access, refresh] as const;
};

const generateAccessCookie = (
  res: Response,
  payload: TokenPayload,
  cookieConfig: AccessCookieConfig,
) => {
  const accessToken = generateToken(
    payload,
    {
      key: cookieConfig.SIGNING_KEYS.PRIVATE,
      passphrase: cookieConfig.SIGNING_KEYS.PASSPHRASE,
    },
    cookieConfig.ACCESS.ISSUER,
    cookieConfig.ACCESS.ALGORITHM,
    cookieConfig.ACCESS.EXPIRY,
    cookieConfig.ACCESS.AUDIENCE,
  );

  res.cookie(cookieConfig.ACCESS.COOKIE.ID, accessToken, {
    maxAge: 5 * 60 * 1000,
    httpOnly: true,
    sameSite: "none",
    secure: true,
    domain: cookieConfig.ACCESS.COOKIE.DOMAIN,
  });
};

const generateRefreshCookie = async (
  prisma: PrismaClient,
  res: Response,
  payload: TokenPayload,
  cookieConfig: RefreshCookieConfig,
) => {
  let id: string;
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
      key: cookieConfig.SIGNING_KEYS.PRIVATE,
      passphrase: cookieConfig.SIGNING_KEYS.PASSPHRASE,
    },
    cookieConfig.REFRESH.ISSUER,
    cookieConfig.REFRESH.ALGORITHM,
    undefined,
    [cookieConfig.REFRESH.ISSUER],
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

  res.cookie(cookieConfig.REFRESH.COOKIE.ID, refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: true,
    domain: cookieConfig.REFRESH.COOKIE.DOMAIN,
  });
};

export const setCookies = async (
  prisma: PrismaClient,
  res: Response,
  payload: TokenPayload,
  cookieConfig: AccessCookieConfig & RefreshCookieConfig,
) => {
  generateAccessCookie(res, payload, cookieConfig);
  await generateRefreshCookie(prisma, res, payload, cookieConfig);
};

const validateCookies = async (
  res: Response,
  prisma: PrismaClient,
  access: string | undefined,
  refresh: string | undefined,
  cookieConfig: AccessCookieConfig & RefreshCookieConfig,
): Promise<AuthValidation> => {
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
      jwt.verify(access ?? "ERROR", cookieConfig.SIGNING_KEYS.PUBLIC, {
        issuer: cookieConfig.ACCESS.ISSUER,
        audience: cookieConfig.ACCESS.AUDIENCE,
        algorithms: [cookieConfig.ACCESS.ALGORITHM],
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
    generateAccessCookie(res, refreshRecord.user, cookieConfig);
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

export const clearCookies = async (
  accessCookieId: string,
  refreshCookieId: string,
  prisma: PrismaClient,
  username: string,
  res: Response,
) => {
  res.clearCookie(accessCookieId);
  res.clearCookie(refreshCookieId);
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

export const cookieMiddleware = async (
  prisma: PrismaClient,
  req: Request,
  res: Response,
  next: () => void,
  cookieConfig: AccessCookieConfig & RefreshCookieConfig,
  authorize: (role: string, url: string) => boolean,
  credentials: { username: string; role: string } | undefined = undefined,
) => {
  if (credentials !== undefined) {
    req.username = credentials.username;
    req.role = credentials.role;
    next();
    return;
  }

  try {
    const [access, refresh] = extractCookies(
      req,
      cookieConfig.ACCESS.COOKIE.ID,
      cookieConfig.REFRESH.COOKIE.ID,
    );
    const { username, role } = await validateCookies(
      res,
      prisma,
      access,
      refresh,
      cookieConfig,
    );

    if (!authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.username = username;
    req.role = role;

    next();
  } catch (_e) {
    res.sendStatus(401);
    return;
  }
};

const thirdPartyCookieValidation = (
  cookie: string | undefined,
  cookieConfig: ThirdPartyCookieConfig,
) => {
  if (cookie === undefined) throw new Error("No token provided");
  if (
    cookieConfig.algorithm === undefined ||
    cookieConfig.audience === undefined
  )
    throw new Error("Auth not configured");
  if (cookieConfig.signingKey === null)
    throw new Error("Signing key not available");
  const { role } = jwt.verify(cookie, cookieConfig.signingKey, {
    algorithms: [cookieConfig.algorithm],
    audience: cookieConfig.audience,
  }) as TokenPayload;
  return { role };
};

export const thirdPartyCookieMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
  cookieConfig: ThirdPartyCookieConfig,
  authorize: (role: string, url: string) => boolean,
  credentials: { username: string; role: string } | undefined = undefined,
) => {
  if (credentials !== undefined) {
    req.username = credentials.username;
    req.role = credentials.role;
    next();
    return;
  }
  try {
    const [access, _refresh] = extractCookies(
      req,
      cookieConfig.cookieId ?? "",
      "",
    );
    const { role } = thirdPartyCookieValidation(access, cookieConfig);

    if (!authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    next();
  } catch (e) {
    console.error(e);
    res.sendStatus(401);
  }
};

export const thirdPartySocketCookieMiddleware = (
  req: Request & {
    _query: { sid?: string };
  },
  next: (err?: Error) => void,
  cookieConfig: ThirdPartyCookieConfig,
  authorize: (role: string) => boolean,
  credentials: { username: string; role: string } | undefined = undefined,
) => {
  if (credentials !== undefined) {
    req.username = credentials.username;
    req.role = credentials.role;
    next();
    return;
  }
  const handshake = req._query.sid === undefined;
  if (!handshake) {
    next();
    return;
  }
  try {
    const [access, _refresh] = extractCookies(
      req,
      cookieConfig.cookieId ?? "",
      "",
    );
    const { role } = thirdPartyCookieValidation(access, cookieConfig);
    if (!authorize(role)) {
      next(new Error("UNAUTHORIZED"));
      return;
    }
    next();
  } catch (e) {
    next(new Error("UNAUTHORIZED"));
  }
};

export const socketCookieMiddleware = async (
  prisma: PrismaClient,
  req: Request & {
    _query: { sid?: string };
  },
  res: Response,
  next: (err?: Error) => void,
  cookieConfig: AccessCookieConfig & RefreshCookieConfig,
  authorize: (role: string) => boolean,
  credentials: { username: string; role: string } | undefined = undefined,
) => {
  if (credentials !== undefined) {
    req.username = credentials.username;
    req.role = credentials.role;
    next();
    return;
  }
  const handshake = req._query.sid === undefined;
  if (!handshake) {
    next();
    return;
  }
  try {
    const [access, refresh] = extractCookies(
      req,
      cookieConfig.ACCESS.COOKIE.ID,
      cookieConfig.REFRESH.COOKIE.ID,
    );
    const { role } = await validateCookies(
      res,
      prisma,
      access,
      refresh,
      cookieConfig,
    );
    if (!authorize(role)) {
      next(new Error("UNAUTHORIZED"));
      return;
    }
    next();
  } catch (e) {
    next(new Error("UNAUTHORIZED"));
  }
};
