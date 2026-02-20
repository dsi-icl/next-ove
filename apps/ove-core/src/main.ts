/* global process, __dirname */

import "./otel";

import * as path from "path";
import cors from "cors";
import { env, logger } from "./env";
import auth from "./server/auth";
import * as dotenv from "dotenv";
import * as express from "express";
import { prisma } from "./server/db";
import cookieParser from "cookie-parser";
import { appRouter } from "./server/router";
import promBundle from "express-prom-bundle";
import { app } from "./server/app";
import { state } from "./server/state";
import { createContext } from "./server/context";
import { openApiDocument } from "./server/open-api";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";
import {
  apiKeyMiddleware,
  clearCookies,
  cookieMiddleware,
  credentialsMiddleware,
  generateOTP,
  getUser,
  otpMiddleware,
  redirectMiddleware,
  type Request,
  setCookies
} from "@ove/ove-auth";

const metricsMiddleware = promBundle({
  includeMethod: true,
  metricsPath: "/metrics",
});

dotenv.config();

if (process.env.PRISMA_QUERY_ENGINE_BINARY === undefined) {
  process.exit(1);
}

app.use(metricsMiddleware);
// noinspection DuplicatedCode
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/signing-key", (_req, res) => {
  res.send(env.TOKENS.SIGNING_KEYS.PUBLIC);
});

app.use("/api/otp", async (req: Request, res, next) =>
  cookieMiddleware(
    prisma,
    req,
    res,
    next,
    env.TOKENS,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.use("/api/otp", async (req: Request, res, next) =>
  apiKeyMiddleware(
    prisma,
    req,
    res,
    next,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.get("/api/otp", async (req: Request, res) => {
  if (req.username === undefined || req.role === undefined) {
    res.sendStatus(401);
    return;
  }

  res.send(generateOTP({ username: req.username, role: req.role }, env.TOKENS));
});

app.use("/api/login", async (req: Request, res, next) =>
  credentialsMiddleware(
    prisma,
    req,
    res,
    next,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.use("/api/login", async (req: Request, res, next) =>
  apiKeyMiddleware(
    prisma,
    req,
    res,
    next,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.post("/api/login", async (req: Request, res) => {
  if (req.username === undefined || req.role === undefined) {
    res.sendStatus(401);
    return;
  }

  await setCookies(
    prisma,
    res,
    { username: req.username, role: req.role },
    env.TOKENS,
  );

  res.send(await getUser(req.username, prisma));
});

app.use("/api/refresh", async (req, res, next) =>
  cookieMiddleware(
    prisma,
    req,
    res,
    next,
    env.TOKENS,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.get("/api/refresh", async (req: Request, res) => {
  if (req.username === undefined || req.role === undefined) {
    res.sendStatus(401);
    return;
  }

  res.send(await getUser(req.username, prisma));
});

app.use("/api/validate", async (req, res, next) =>
  cookieMiddleware(
    prisma,
    req,
    res,
    next,
    env.TOKENS,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.get("/api/validate", async (_req: Request, res) => {
  res.status(200).end();
});

app.use("/api/logout", async (req, res, next) =>
  cookieMiddleware(
    prisma,
    req,
    res,
    next,
    env.TOKENS,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.post("/api/logout", async (req: Request, res) => {
  if (req.username === undefined || req.role === undefined) {
    res.sendStatus(401);
    return;
  }

  try {
    await clearCookies(
      env.TOKENS.ACCESS.COOKIE.ID,
      env.TOKENS.REFRESH.COOKIE.ID,
      prisma,
      req.username,
      res,
    );

    res.sendStatus(200);
  } catch (_e) {
    res.sendStatus(401);
  }
});

app.use("/api/redirect", async (req, res, next) =>
  otpMiddleware(
    state.otps,
    req,
    res,
    next,
    env.TOKENS,
    auth.authorize,
    auth.getCredentials(),
  ),
);
app.use("/api/redirect", async (req, res, next) =>
  redirectMiddleware(req, res, next, auth.authorize),
);

app.get("/api/redirect", async (req: Request, res) => {
  if (
    req.role === undefined ||
    req.username === undefined ||
    req.to === undefined
  ) {
    res.sendStatus(403);
    return;
  }

  await setCookies(
    prisma,
    res,
    { username: req.username, role: req.role },
    env.TOKENS,
  );

  res.redirect(req.to);
});

app.use("/sockets/admin", async (req, res, next) =>
  cookieMiddleware(
    prisma,
    req,
    res,
    next,
    env.TOKENS,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.use("/sockets/admin", express.static(env.SOCKETS.DIST_DIR));

app.use(`/api/v${env.API_VERSION}/trpc`, async (req: Request, res, next) =>
  cookieMiddleware(
    prisma,
    req,
    res,
    next,
    env.TOKENS,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.use(
  `/api/v${env.API_VERSION}/trpc`,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      logger.error(error);
    },
  }),
);

app.use(`/api/v${env.API_VERSION}`, async (req: Request, res, next) =>
  cookieMiddleware(
    prisma,
    req,
    res,
    next,
    env.TOKENS,
    auth.authorize,
    auth.getCredentials(),
  ),
);

app.use(
  `/api/v${env.API_VERSION}`,
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      logger.error(error);
    },
  }) as Parameters<typeof app.use>[1],
);

const authOpenApiPaths = {
  "/api/signing-key": {
    get: {
      summary: "Get public signing key",
      responses: {
        200: {
          description: "Public signing key",
          content: {
            "text/plain": {
              schema: {
                type: "string",
              },
            },
          },
        },
      },
    },
  },

  "/api/otp": {
    get: {
      summary: "Generate OTP",
      security: [{ cookieAuth: [] }, { apiKeyAuth: [] }],
      responses: {
        200: {
          description: "Generated OTP",
          content: {
            "application/json": {
              schema: {
                type: "string",
              },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/login": {
    post: {
      summary: "Login and set auth cookies",
      security: [{ apiKeyAuth: [] }],
      responses: {
        200: {
          description: "Authenticated user",
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/refresh": {
    get: {
      summary: "Refresh user session",
      security: [{ cookieAuth: [] }],
      responses: {
        200: {
          description: "Authenticated user",
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: true,
              },
            },
          },
        },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/validate": {
    get: {
      summary: "Validate current session",
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: "Session is valid" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/logout": {
    post: {
      summary: "Logout and clear cookies",
      security: [{ cookieAuth: [] }],
      responses: {
        200: { description: "Logged out" },
        401: { description: "Unauthorized" },
      },
    },
  },

  "/api/redirect": {
    get: {
      summary: "OTP-based redirect login",
      security: [{ otpAuth: [] }],
      parameters: [
        {
          name: "to",
          in: "query",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        302: { description: "Redirect to target" },
        403: { description: "Forbidden" },
      },
    },
  },
};

app.get("/openapi.json", (_req, res) => {
  res.send({
    ...openApiDocument,
    paths: {
      ...openApiDocument.paths,
      ...authOpenApiPaths,
    },
    components: {
      ...openApiDocument.components,
      securitySchemes: {
        ...openApiDocument.components?.securitySchemes,

        // ADDED: shared auth mechanisms
        cookieAuth: {
          type: "apiKey",
          in: "cookie",
          name: env.TOKENS.ACCESS.COOKIE.ID,
        },
        apiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
        },
        otpAuth: {
          type: "apiKey",
          in: "query",
          name: "otp",
        },
      },
    },
  });
});

app.get("/api/docs", (_req, res) =>
  res.sendFile(path.join(__dirname, "assets", "docs.html")),
);

if (env.DOCS !== undefined) {
  app.use("/docs", express.static(env.DOCS));
}
// app.use("/docs/features", express.static(path.join(__dirname, "public", "docs", "features", "public")));

app.use((req, res, next) => {
  const reqPath = req.path.endsWith("/")
    ? req.path.substring(0, req.path.length - 1)
    : req.path;
  if (/(.ico|.js|.css|.jpg|.png|.map|.svg|.woff|.woff2|.json)$/i.test(reqPath)) {
    const filePath = path.join(env.SERVICES.UI, ...reqPath.split("/"));
    res.sendFile(filePath);
  } else if (reqPath.includes("socket") && reqPath !== "/sockets") {
    next();
    return;
  } else {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    res.sendFile(path.join(env.SERVICES.UI, "index.html"));
  }
});
