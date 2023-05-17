/* global process, __dirname */

import * as path from "path";
import * as cors from "cors";
import * as express from "express";
import * as swaggerUi from "swagger-ui-express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createOpenApiExpressMiddleware } from "trpc-openapi";
import {
  app,
  appRouter,
  createContext,
  openApiDocument,
  server
} from "@ove/ove-core-router";

// noinspection DuplicatedCode
app.use(cors({ origin: "*" }));

app.use("/api/v1/trpc", trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext
}));

app.use("/api/v1", createOpenApiExpressMiddleware({
  router: appRouter,
  createContext
}));

app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(openApiDocument));

app.use("/assets", express.static(path.join(__dirname, "assets")));

const port = process.env.port || 3333;
server.listen(port, () => console.log(`Listening at http://localhost:${port}`)).on("error", console.error);
