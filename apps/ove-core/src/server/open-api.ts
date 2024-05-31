import { env } from "../env";
import { appRouter } from "./router";
import { generateOpenApiDocument } from "trpc-openapi";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: env.TITLE,
  description: env.DESCRIPTION,
  version: env.VERSION,
  baseUrl: `${env.PROTOCOL}://${env.HOSTNAME}:${env.PORT}/api/v${env.API_VERSION}`,
});
