import cors from "cors";
import { env } from "./env";
import * as path from "path";
import { app } from "./server/app";
import * as express from "express";
import { appRouter } from "./server/router";
import FileUtils from "@ove/ove-server-utils";
import * as swaggerUi from "swagger-ui-express";
import { createContext } from "./server/context";
import { openApiDocument } from "./server/open-api";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createOpenApiExpressMiddleware } from "trpc-openapi";


// noinspection DuplicatedCode
app.use(cors({ origin: "*" }));

app.use("/admin", express.static(env.SOCKET_DIST));

app.use(`/api/v${env.API_VERSION}/trpc`, trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext
}));

app.use(`/api/v${env.API_VERSION}`, createOpenApiExpressMiddleware({
  router: appRouter,
  createContext
}) as Parameters<typeof app.use>[1]);

app.use("/api", swaggerUi.serve);
app.get("/api", swaggerUi.setup(openApiDocument));

if (env.NODE_ENV === "development") {
  FileUtils.saveSwagger(
    path.join(`v${env.API_VERSION}`, "core.swagger.json"), openApiDocument);
}

app.use((req, res, next) => {
  const reqPath = req.path.endsWith("/") ?
    req.path.substring(0, req.path.length - 1) : req.path;
  if (/(.ico|.js|.css|.jpg|.png|.map|.svg|.woff|.woff2)$/i.test(reqPath)) {
    const filePath = path.join(env.UI_URL, ...reqPath.split("/"));
    res.sendFile(filePath);
  } else if (reqPath.includes("socket") && reqPath !== "/sockets") {
    next();
    return;
  } else {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    res.sendFile(path.join(env.UI_URL, "index.html"));
  }
});
