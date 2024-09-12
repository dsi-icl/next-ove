import { env, logger } from "../env";
import { app } from "./app";

export const server = app.listen(env.PORT, env.HOSTNAME, () => {
  logger.info(`Listening at ${env.HOSTNAME}:${env.PORT}`);
}).on("error", logger.error);