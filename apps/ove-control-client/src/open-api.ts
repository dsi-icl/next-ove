import { appRouter } from "./routes/app";
import { generateOpenApiDocument } from "trpc-openapi";

export const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "OVE Control Client",
  description: "Client for controlling nodes within an observatory",
  version: "1.0.0",
  baseUrl: "http://localhost:3000/api/v1",
});
