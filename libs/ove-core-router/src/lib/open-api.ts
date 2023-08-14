import { generateOpenApiDocument } from "trpc-openapi";
import { appRouter } from "./router";
import { env } from "@ove/ove-core-env";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "next-ove core",
  description: "next-ove core service",
  version: env.VERSION,
  baseUrl: `${env.PROTOCOL}://${env.HOSTNAME}:${env.PORT}/api/v${env.API_VERSION}`,
});
