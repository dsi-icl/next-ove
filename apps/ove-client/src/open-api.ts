import { app } from "electron";
import { env } from "@ove/ove-client-env";
import { appRouter } from "@ove/ove-client-router";
import { generateOpenApiDocument } from "trpc-openapi";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Next-OVE Client",
  description: "Hardware control interface for observatory rendering nodes.",
  version: app.getVersion(),
  baseUrl: `${env.PROTOCOL ?? "http"}://${env.HOSTNAME ?? "localhost"}:${env.PORT ?? "8080"}/api/v${env.API_VERSION}`
});