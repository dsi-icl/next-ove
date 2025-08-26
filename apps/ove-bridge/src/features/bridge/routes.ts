import {
  setSocket,
  socket,
  socketConnectListeners,
  socketDisconnectListeners,
} from "./sockets";
import { io } from "socket.io-client";
import { assert } from "@ove/ove-utils";
import { env, logger } from "../../env";
import { controller } from "./controller";
import type { TCallback, TParameters, TSocketOutEvents } from "@ove/ove-types";
import { updateCookie } from "../../utils/auth";
import { getAgent } from "../../utils/agent";

export const initBridge = async () => {
  if (env.CORE?.URL === undefined || env.AUTH.NAME === undefined) return;
  const agent = getAgent();
  setSocket(
    io(`${env.CORE.URL}/socket/bridge`, {
      auth: {
        username: env.AUTH.NAME,
        password: env.AUTH.API_KEY,
      },
      path: `${env.CORE.SOCKET_PATH ?? ""}/${env.CORE_API_VERSION}`,
      withCredentials: true,
      extraHeaders: {
        Cookie: (await updateCookie()) as unknown as string,
      },
      transportOptions: {
        polling: { agent },
        websocket: { agent }
      }
    }),
  );
  if (socket === null) throw new Error("ILLEGAL");

  socket.on("connect", () => {
    logger.info(`${assert(socket).id} connected to /bridge`);
    socketConnectListeners.forEach((x) => x());
  });

  socket.on("disconnect", () => {
    logger.info(`${assert(socket).id} disconnected from /bridge`);
    socketDisconnectListeners.forEach((x) => x());
  });

  const getHandler = <Key extends keyof TSocketOutEvents>(k: Key) => {
    return ((args: TParameters<Key>, callback: TCallback<Key>) => {
      controller[k](args).then((res) => {
        callback(res);
        logger.info(`Handled: ${k}`);
      });
    }) as TSocketOutEvents[Key];
  };

  (Object.keys(controller) as Array<keyof TSocketOutEvents>).forEach((k) => {
    assert(socket).on<typeof k>(k, getHandler(k));
  });

  socket.on("connect_error", async (err) => {
    logger.error(`connection error due to ${err.message}`);
    if (socket?.io?.opts?.extraHeaders === undefined)
      throw new Error("Missing headers");
    socket.io.opts.extraHeaders.Cookie =
      (await updateCookie()) as unknown as string;
    socket?.disconnect()?.connect();
  });
};
