/* global __dirname */

import * as path from "path";
import cors from "cors";
import { app } from "./server/app";
import { appRouter } from "./server/router";
import { createContext } from "./server/context";
import { openApiDocument } from "./server/open-api";
import * as express from "express";
import { env } from "./env";
import FileUtils from "@ove/ove-server-utils";
import * as swaggerUi from "swagger-ui-express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createOpenApiExpressMiddleware } from "trpc-openapi";


// noinspection DuplicatedCode
app.use(cors({ origin: "*" }));

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
