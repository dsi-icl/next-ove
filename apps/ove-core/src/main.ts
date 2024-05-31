/* global __dirname */

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

app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(openApiDocument));

if (env.NODE_ENV === "development") {
  FileUtils.saveSwagger(
    path.join(`v${env.API_VERSION}`, "core.swagger.json"), openApiDocument);
}

app.use("/assets", express.static(path.join(__dirname, "assets")));
