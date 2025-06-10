/* global __dirname, process */

import cors from "cors";
import * as path from "path";
import express from "express";
import { appRouter } from "./server/router";
import { createContext } from "./server/context";
import * as swaggerUi from "swagger-ui-express";
import { init } from "./server/hardware/controller";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";
import * as trpcExpress from "@trpc/server/adapters/express";
import { openApiDocument } from "./open-api";
import FileUtils from "@ove/ove-server-utils";
import {
  closeWindow,
  createWindow,
  reloadWindow,
  reloadWindows,
  takeScreenshots,
  triggerIPC,
} from "./electron";
import { env, logger } from "./env";
import * as http from "node:http";
import * as https from "node:https";
import { readFileSync } from "fs";

export const start = () => {
  const app = express();
  init(
    createWindow,
    takeScreenshots,
    closeWindow,
    reloadWindow,
    reloadWindows,
    triggerIPC,
  );

  app.use(cors({ origin: "*" }));

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

  const openapi = createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      logger.error(error);
    },
  });
  app.use(
    `/api/v${env.API_VERSION}`,
    openapi as unknown as () => Awaited<ReturnType<typeof openapi>>,
  );

  app.use("/", swaggerUi.serve);
  app.get("/", swaggerUi.setup(openApiDocument));

  if (process.env.NODE_ENV === "development") {
    FileUtils.saveOpenApi(
      path.join(`v${env.API_VERSION}`, "client.swagger.json"),
      openApiDocument,
    );
  }

  app.use("/assets", express.static(path.join(__dirname, "assets")));

  const server =
    env.PROTOCOL.TYPE === "http"
      ? http.createServer(app)
      : https.createServer(
          {
            key: readFileSync(env.PROTOCOL.KEY),
            cert: readFileSync(env.PROTOCOL.CERTIFICATE),
            ca: readFileSync(env.PROTOCOL.CA),
          },
          app,
        );

  server.listen(env.PORT, `${env.HOSTNAME}`, () => {
    logger.info(
      `Listening at ${env.PROTOCOL.TYPE}://${env.HOSTNAME}:${env.PORT}`,
    );
  });

  server.on("error", logger.error);

  return () => {
    server.close();
  };
};
