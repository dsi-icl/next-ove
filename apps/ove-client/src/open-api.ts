import { app } from "electron";
import { env } from "@ove/ove-client-env";
import { appRouter } from "@ove/ove-client-router";
import { generateOpenApiDocument } from "trpc-openapi";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "next-ove client",
  description: "Control interface for observatory rendering nodes.",
  version: app.getVersion(),
  baseUrl: `${env.PROTOCOL}://${env.HOSTNAME}:${env.PORT}/api/v${env.API_VERSION}`
});
