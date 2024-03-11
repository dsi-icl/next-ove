import express from "express";
import { env, logger } from "../env";

export const app = express();

export const server = app.listen(env.PORT, env.HOSTNAME, () => {
  logger.info(`Listening at ${env.HOSTNAME}:${env.PORT}`);
}).on("error", logger.error);
