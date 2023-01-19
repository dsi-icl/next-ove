import * as cors from "cors";
import * as path from "path";
import * as express from "express";
import { logger } from "./app/utils";
import { appRouter } from "./routes/app";
import { createContext } from "./context";
import * as swaggerUi from "swagger-ui-express";
import {createOpenApiExpressMiddleware} from "trpc-openapi";
import * as trpcExpress from "@trpc/server/adapters/express";
import { openApiDocument } from "./open-api";

const app = express();

app.use(cors());

app.use("/api/v1/trpc", trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext
}));

app.use("/api/v1", createOpenApiExpressMiddleware({
  router: appRouter,
  createContext
}));

app.use("/", swaggerUi.serve);
app.get("/", swaggerUi.setup(openApiDocument))

app.use("/assets", express.static(path.join(__dirname, "assets")));

const port = process.env.port || 3335;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`);
});

server.on("error", console.error);
