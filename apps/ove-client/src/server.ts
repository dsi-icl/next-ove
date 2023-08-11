/* global __dirname, process  */

import cors from "cors";
import * as path from "path";
import express from "express";
import { appRouter, init, createContext } from "@ove/ove-client-router";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
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

  const port = env.PORT ?? 8080;
  const server = app.listen(port, env.HOSTNAME ?? "127.0.0.1", () => {
    logger.info(`Listening at ${env.PROTOCOL ?? "http"}://${env.HOSTNAME}:${port}`);
  });

  server.on("error", logger.error);

  return (): void => { server.close() };
};
