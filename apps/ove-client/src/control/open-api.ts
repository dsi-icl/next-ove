import { appRouter } from "./router";
import { generateOpenApiDocument } from "trpc-openapi";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "OVE Control Client",
  description: "Client for controlling nodes within an observatory",
  version: "1.0.0",
  baseUrl: "http://localhost:3335/api/v1",
});
