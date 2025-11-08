import { env, logger } from "../env";
import { app } from "./app";

export const server = app
  .listen(env.SERVER.PORT, env.SERVER.HOSTNAME, () => {
    logger.info(`Listening at ${env.SERVER.HOSTNAME}:${env.SERVER.PORT}`);
  })
  .on("error", logger.error);
