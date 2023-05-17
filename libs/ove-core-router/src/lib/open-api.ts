import { generateOpenApiDocument } from "trpc-openapi";
import { appRouter } from "./router";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "OVE Core",
  description: "OVE Core Service",
  version: "0.0.0",
  baseUrl: "http://localhost:3333/api/v1",
});
