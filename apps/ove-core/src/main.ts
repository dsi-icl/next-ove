// noinspection DuplicatedCode

import * as path from "path";
import * as cors from "cors";
import * as express from "express";
import { createContext } from "./context";
import { openApiDocument } from "./open-api";
import { appRouter } from "./routes/app";
import * as swaggerUi from "swagger-ui-express";
import * as trpcExpress from "@trpc/server/adapters/express";
import { createOpenApiExpressMiddleware } from "trpc-openapi";
import { app, logger, server } from "./app";


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
server.listen(port, () => logger.info(`Listening at http://localhost:${port}`)).on("error", logger.error);
