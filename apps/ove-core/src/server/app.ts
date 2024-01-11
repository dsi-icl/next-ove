/* global __dirname */

import * as path from "path";
import express from "express";
import { env, logger } from "../env";

export const app = express();

app.use("/admin", express.static(path.join(__dirname, "..", "..", "..",
  "node_modules", "@socket.io", "admin-ui", "ui", "dist")));

export const server = app.listen(env.PORT, env.HOSTNAME, () => {
  logger.info(`Listening at ${env.HOSTNAME}:${env.PORT}`);
}).on("error", logger.error);
