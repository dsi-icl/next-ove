import * as path from "path";
import * as express from "express";
import { logger } from "./app/utils";
import { appRouter } from "./routes/app";
import { createContext } from "./context";
import * as trpcExpress from "@trpc/server/adapters/express";

const app = express();

app.use("/trpc", trpcExpress.createExpressMiddleware({
  router: appRouter,
  createContext
}));

app.use("/assets", express.static(path.join(__dirname, "assets")));

const port = process.env.port || 3335;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`);
});

server.on("error", console.error);
