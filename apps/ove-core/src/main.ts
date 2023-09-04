/* global __dirname */

import * as path from "path";
import cors from "cors";
import { app } from "./app/app";
import { appRouter } from "./app/router";
import { createContext } from "./app/context";
import { openApiDocument } from "./app/open-api";
import * as express from "express";
import { env } from "./env";
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
}) as any);

app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(openApiDocument));

app.use("/assets", express.static(path.join(__dirname, "assets")));
