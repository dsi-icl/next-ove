import { hardwareRouter } from "./routes/hardware";
import { generateOpenApiDocument } from "trpc-openapi";

export const openApiDocument = generateOpenApiDocument(hardwareRouter, {
  title: "OVE Hardware Bridge",
  description: "Bridge between the OVE Core Service and the local hardware",
  version: "1.0.0",
  baseUrl: "http://localhost:3333/api/v1",
});
