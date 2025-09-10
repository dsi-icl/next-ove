/* global process, __dirname */

import * as path from "path";
import cors from "cors";
import { env } from "./env";
import auth from "./server/auth";
import * as dotenv from "dotenv";
import * as express from "express";
import { prisma } from "./server/db";
import cookieParser from "cookie-parser";
import { appRouter } from "./server/router";
import promBundle from "express-prom-bundle";
import FileUtils from "@ove/ove-server-utils";
import { app } from "./server/app";
import { state } from "./server/state";
import { createContext } from "./server/context";
import { openApiDocument } from "./server/open-api";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";
import {
  type Request,
  credentialsMiddleware,
  apiKeyMiddleware,
  generateOTP,
  cookieMiddleware,
  setCookies,
  getUser,
  clearCookies,
  otpMiddleware,
  redirectMiddleware,
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
  cookieMiddleware(prisma, req, res, next, env.TOKENS, auth.authorize, auth.getCredentials()),
);

app.use("/api/otp", async (req: Request, res, next) =>
  apiKeyMiddleware(prisma, req, res, next, auth.authorize, auth.getCredentials()),
);

app.get("/api/otp", async (req: Request, res) => {
  if (req.username === undefined || req.role === undefined) {
    res.sendStatus(401);
    return;
  }

  res.send(generateOTP({ username: req.username, role: req.role }, env.TOKENS));
});

app.use("/api/login", async (req: Request, res, next) =>
  credentialsMiddleware(prisma, req, res, next, auth.authorize, auth.getCredentials()),
);

app.use("/api/login", async (req: Request, res, next) =>
  apiKeyMiddleware(prisma, req, res, next, auth.authorize, auth.getCredentials()),
);

app.post("/api/login", async (req: Request, res) => {
  if (req.username === undefined || req.role === undefined) {
    res.sendStatus(401);
    return;
  }

  await setCookies(prisma, res, { username: req.username, role: req.role }, env.TOKENS);

  res.send(await getUser(req.username, prisma));
});

app.use("/api/logout", async (req, res, next) =>
  cookieMiddleware(prisma, req, res, next, env.TOKENS, auth.authorize, auth.getCredentials()),
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
  otpMiddleware(state.otps, req, res, next, env.TOKENS, auth.authorize, auth.getCredentials()),
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

  await setCookies(prisma, res, { username: req.username, role: req.role }, env.TOKENS);

  res.redirect(req.to);
});

app.use("/sockets/admin", async (req, res, next) =>
  cookieMiddleware(prisma, req, res, next, env.TOKENS, auth.authorize, auth.getCredentials()),
);

app.use("/sockets/admin", express.static(env.SOCKETS.DIST_DIR));

app.use(`/api/v${env.API_VERSION}/trpc`, async (req: Request, res, next) =>
  cookieMiddleware(prisma, req, res, next, env.TOKENS, auth.authorize, auth.getCredentials()),
);

app.use(
  `/api/v${env.API_VERSION}/trpc`,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(`/api/v${env.API_VERSION}`, async (req: Request, res, next) =>
  cookieMiddleware(prisma, req, res, next, env.TOKENS, auth.authorize, auth.getCredentials()),
);

app.use(
  `/api/v${env.API_VERSION}`,
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
  }) as Parameters<typeof app.use>[1],
);

// TODO: merge OpenApi schema with routes in this file
app.get("/api/ove-core.json", (_req, res) => {
  res.send(openApiDocument);
});

app.get("/api", (_req, res) => {
  res.sendFile(path.join(__dirname, "assets", "docs.html"));
});

FileUtils.saveOpenApi(
  path.join(`v${env.API_VERSION}`, "ove-core.swagger.json"),
  openApiDocument,
);

app.use((req, res, next) => {
  const reqPath = req.path.endsWith("/")
    ? req.path.substring(0, req.path.length - 1)
    : req.path;
  if (/(.ico|.js|.css|.jpg|.png|.map|.svg|.woff|.woff2)$/i.test(reqPath)) {
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
