/* global __dirname */

import cors from "cors";
import * as path from "path";
import express from "express";
import { appRouter, init, createContext } from "@ove/ove-client-router";
import * as swaggerUi from "swagger-ui-express";
import { createOpenApiExpressMiddleware } from "trpc-openapi";
import * as trpcExpress from "@trpc/server/adapters/express";
import { openApiDocument } from "./open-api";
import {
  createWindow,
  takeScreenshots,
  closeWindow,
  triggerIPC
} from "./electron";
import { env, logger } from "@ove/ove-client-env";

export const start = () => {
  const app = express();
  init(createWindow, takeScreenshots, closeWindow, triggerIPC);

  app.use(cors({ origin: "*" }));

  app.use(`/api/v${env.API_VERSION}/trpc`, trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext
  }));

  app.use(`/api/v${env.API_VERSION}`, createOpenApiExpressMiddleware({
    router: appRouter,
    createContext
  }));

  app.use("/", swaggerUi.serve);
  app.get("/", swaggerUi.setup(openApiDocument));

  app.use("/assets", express.static(path.join(__dirname, "assets")));

  const server = app.listen(env.PORT, env.HOSTNAME, () => {
    logger.info(`Listening at ${env.HOSTNAME}:${env.PORT}`);
  });

  server.on("error", logger.error);

  return (): void => {
    server.close();
  };
};
