import { io } from "socket.io-client";
import { env } from "./env";

export const logSocket =
  env.LOGGING?.SERVER?.SOCKET_ENDPOINT !== undefined
    ? io(env.LOGGING.SERVER.SOCKET_ENDPOINT, {
        autoConnect: false,
        path: env.LOGGING?.SERVER?.SOCKET_PATH ?? "/sockets",
      })
    : null;
