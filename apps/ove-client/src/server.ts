/* global __dirname, process */

import cors from "cors";
import * as path from "path";
import express from "express";
import { appRouter } from "./server/router";
import promBundle from "express-prom-bundle";
import * as swaggerUi from "swagger-ui-express";
import { createContext } from "./server/context";
import { init } from "./server/hardware/controller";
import { createOpenApiExpressMiddleware } from "trpc-to-openapi";
import * as trpcExpress from "@trpc/server/adapters/express";
import { openApiDocument } from "./open-api";
import * as FileUtils from "@ove/ove-server-utils";
import {
  closeBrowser,
  createBrowser,
  reloadBrowser,
  reloadBrowsers,
  takeScreenshots,
  triggerIPC
} from "./electron";
import { env, logger } from "./env";
import * as http from "node:http";
import * as https from "node:https";
import { readFileSync } from "fs";

const metricsMiddleware = promBundle({
  includeMethod: true,
  metricsPath: "/metrics",
});

export const start = () => {
  const app = express();
  init(
    createBrowser,
    takeScreenshots,
    closeBrowser,
    reloadBrowser,
    reloadBrowsers,
    triggerIPC
  );

  app.use(metricsMiddleware);
  app.use(cors({ origin: "*" }));

  app.use(
    `/api/v${env.API_VERSION}/trpc`,
    trpcExpress.createExpressMiddleware({
      router: appRouter,
      createContext,
      onError: ({ error }) => {
        logger.error(error);
      }
    })
  );

  const openapi = createOpenApiExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      logger.error(error);
    }
  });
  app.use(
    `/api/v${env.API_VERSION}`,
    openapi as unknown as () => Awaited<ReturnType<typeof openapi>>
  );

  app.use("/", swaggerUi.serve);
  app.get("/", swaggerUi.setup(openApiDocument));

  if (process.env.NODE_ENV === "development") {
    FileUtils.saveOpenApi(
      path.join(`v${env.API_VERSION}`, "client.swagger.json"),
      openApiDocument
    );
  }

  app.use("/assets", express.static(path.join(__dirname, "assets")));

  const server =
    env.SERVER.PROTOCOL.TYPE === "http"
      ? http.createServer(app)
      : https.createServer(
        {
          key: readFileSync(env.SERVER.PROTOCOL.KEY),
          cert: readFileSync(env.SERVER.PROTOCOL.CERTIFICATE),
          ca: readFileSync(env.SERVER.PROTOCOL.CA)
        },
        app
      );

  server.listen(env.SERVER.PORT, `${env.SERVER.HOSTNAME}`, () => {
    logger.info(
      `Listening at ${env.SERVER.PROTOCOL.TYPE}://${env.SERVER.HOSTNAME}:${env.SERVER.PORT}`
    );
  });

  server.on("error", logger.error);

  return () => {
    server.close();
  };
};
