import { env } from "./env";
import { appRouter } from "./server/router";
import { generateOpenApiDocument } from "trpc-to-openapi";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: env.TITLE,
  description: env.DESCRIPTION,
  version: env.API_VERSION.toString(),
  baseUrl: `${env.SERVER.PROTOCOL}://${env.SERVER.HOSTNAME}:${env.SERVER.PORT}/api/v${env.API_VERSION}`,
});
