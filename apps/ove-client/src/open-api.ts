import { app } from "electron";
import { env } from "./env";
import { appRouter } from "./server/router";
import { generateOpenApiDocument } from "trpc-openapi";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: env.TITLE,
  description: env.DESCRIPTION,
  version: app.getVersion(),
  baseUrl: `${env.PROTOCOL}://${env.HOSTNAME}:${env.PORT}/api/v${env.API_VERSION}`
});
