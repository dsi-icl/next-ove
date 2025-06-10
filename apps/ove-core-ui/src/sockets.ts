import { env } from "./env";
import { io } from "socket.io-client";

export const logSocket =
  env.LOGGING?.SERVER?.SOCKET_ENDPOINT !== undefined
    ? io(env.LOGGING.SERVER.SOCKET_ENDPOINT, {
        autoConnect: false,
        path: env.LOGGING?.SERVER?.SOCKET_PATH ?? "/sockets",
        withCredentials: true,
      })
    : null;
