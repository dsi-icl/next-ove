import * as path from "path";
import cors from "cors";
import { env } from "./env";
import auth from "./server/auth";
import * as express from "express";
import cookieParser from "cookie-parser";
import { appRouter } from "./server/router";
import { app, type Request } from "./server/app";
import { createContext } from "./server/context";
import { openApiDocument } from "./server/open-api";
import FileUtils, { prisma } from "@ove/ove-server-utils";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";

if (process.env.PRISMA_QUERY_ENGINE_BINARY === undefined) {
  process.env.PRISMA_QUERY_ENGINE_BINARY = path.join(
    __dirname,
    "..",
    "libquery_engine-darwin-arm64.dylib.node",
  );
}

// noinspection DuplicatedCode
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.get("/signing-key", (_req, res) => {
  res.send(env.TOKENS.SIGNING_KEYS.PUBLIC);
});

app.use("/otp", async (req: Request, res, next) => {
  try {
    const [access, refresh] = auth.extractCookies(req);
    const { username, role } = await auth.validateCookies(
      res,
      prisma,
      access,
      refresh,
    );

    if (!auth.authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.username = username;
    req.role = role;
  } catch (e) {}

  next();
});

app.use("/otp", async (req: Request, res, next) => {
  try {
    const key = auth.extractKey(req);
    const authentication = await auth.validateApiKey(prisma, key);

    if (!auth.authorize(authentication.role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.username = authentication.username;
    req.role = authentication.role;
    next();
  } catch (e) {
    res.sendStatus(401);
  }
});

app.get("/otp", async (req: Request, res) => {
  if (req.username === undefined || req.role === undefined) {
    res.sendStatus(401);
    return;
  }

  res.send(auth.generateOTP({ username: req.username, role: req.role }));
});

app.use("/login", async (req: Request, res, next) => {
  try {
    const credentials = auth.extractCredentials(req);
    const { username, role } = await auth.validatePassword(prisma, credentials);

    if (!auth.authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.username = username;
    req.role = role;
  } catch (e) {}

  next();
});

app.use("/login", async (req: Request, res, next) => {
  if (req.username !== undefined && req.role !== undefined) {
    next();
    return;
  }
  try {
    const key = auth.extractKey(req);
    const { username, role } = await auth.validateApiKey(prisma, key);

    if (!auth.authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.username = username;
    req.role = role;
    next();
  } catch (e) {
    res.sendStatus(401);
  }
});

app.post("/login", async (req: Request, res) => {
  if (req.username === undefined || req.role === undefined) {
    res.sendStatus(401);
    return;
  }

  auth.generateAccessCookie(res, { username: req.username, role: req.role });
  await auth.generateRefreshCookie(res, prisma, {
    username: req.username,
    role: req.role,
  });

  res.send(
    await prisma.user.findUnique({
      where: {
        username: req.username,
      },
      select: {
        username: true,
        email: true,
        name: true,
        icon: true,
        role: true,
      },
    }),
  );
});

app.post("/logout", async (req, res) => {
  try {
    const [access, refresh] = auth.extractCookies(req);
    const { username } = await auth.validateCookies(
      res,
      prisma,
      access,
      refresh,
    );
    await auth.logout(res, prisma, username);
  } catch (e) {
    res.clearCookie(env.TOKENS.ACCESS.COOKIE.ID);
    res.clearCookie(env.TOKENS.REFRESH.COOKIE.ID);
  }

  res.sendStatus(200);
});

app.get("/redirect", async (req, res) => {
  try {
    const otp = auth.extractOTP(req);
    const to = req.query?.["to"] as string | undefined;

    if (to === undefined) {
      res.sendStatus(400);
      return;
    }

    const { role, username } = await auth.validateOTP(otp);
    if (!auth.authorize(role, to)) {
      res.sendStatus(403);
      return;
    }

    auth.generateAccessCookie(res, { role, username });
    await auth.generateRefreshCookie(res, prisma, { role, username });

    res.redirect(to ?? "/");
  } catch (e) {
    res.sendStatus(401);
  }
});

app.use("/admin", async (req, res, next) => {
  try {
    const [access, refresh] = auth.extractCookies(req);

    const authenticated = await auth.validateCookies(
      res,
      prisma,
      access,
      refresh,
    );

    if (!auth.authorize(authenticated.role, "/admin")) {
      res.sendStatus(403);
      return;
    }

    next();
  } catch (e) {
    res.sendStatus(401);
  }
});

app.use("/admin", express.static(env.SOCKETS.DIST_DIR));

app.use(`/api/v${env.API_VERSION}/trpc`, async (req: Request, res, next) => {
  try {
    const [access, refresh] = auth.extractCookies(req);

    const { role, username } = await auth.validateCookies(
      res,
      prisma,
      access,
      refresh,
    );

    if (!auth.authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.username = username;
    req.role = role;
    next();
  } catch (e) {
    res.sendStatus(401);
    return;
  }
});

app.use(
  `/api/v${env.API_VERSION}/trpc`,
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
);

app.use(`/api/v${env.API_VERSION}`, async (req: Request, res, next) => {
  try {
    const [access, refresh] = auth.extractCookies(req);

    const { role, username } = await auth.validateCookies(
      res,
      prisma,
      access,
      refresh,
    );

    if (!auth.authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.username = username;
    req.role = role;
    next();
  } catch (e) {
    res.sendStatus(401);
    return;
  }
});

app.use(
  `/api/v${env.API_VERSION}`,
  createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
  }) as Parameters<typeof app.use>[1],
);

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

app.use(async (req, res, next) => {
  try {
    const [access, refresh] = auth.extractCookies(req);

    const authenticated = await auth.validateCookies(
      res,
      prisma,
      access,
      refresh,
    );

    if (!auth.authorize(authenticated.role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    next();
  } catch (e) {
    res.sendStatus(401);
  }
});

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
