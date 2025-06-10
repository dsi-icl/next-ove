import { env, logger } from "../env";
import { app } from "./app";
import * as http from "node:http";
import * as https from "node:https";

export const server =
  env.SERVER.PROTOCOL.TYPE === "http"
    ? http.createServer(app)
    : https.createServer(
        {
          key: env.SERVER.PROTOCOL.KEY,
          cert: env.SERVER.PROTOCOL.CERTIFICATE,
          ca: env.SERVER.PROTOCOL.CA,
        },
        app,
      );

server
  .listen(env.SERVER.PORT, env.SERVER.HOSTNAME, () => {
    logger.info(`Listening at ${env.SERVER.HOSTNAME}:${env.SERVER.PORT}`);
  })
  .on("error", logger.error);
