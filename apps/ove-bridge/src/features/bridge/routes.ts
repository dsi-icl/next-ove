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
import { setMode } from "./power-scheduler";

export const initBridge = async () => {
  if (env.CORE?.URL === undefined || env.AUTH.NAME === undefined) return;
  setSocket(
    io(`${env.CORE.URL}/socket/bridge`, {
      auth: {
        username: env.AUTH.NAME,
        password: env.AUTH.API_KEY,
      },
      ackTimeout: env.CORE.ACK_TIMEOUT,
      path: `${env.CORE.SOCKET_PATH ?? ""}/${env.CORE_API_VERSION}`,
      withCredentials: true,
      extraHeaders: {
        Cookie: (await updateCookie()) as unknown as string,
      },
    }),
  );
  if (socket === null) throw new Error("ILLEGAL");

  socket.on("connect", () => {
    logger.info(`${assert(socket).id} connected to /bridge`);
    socketConnectListeners.forEach((x) => x());
  });

  socket.on("disconnect", async (reason, description) => {
    logger.info(`Socket disconnected from /bridge`, reason, description ?? "");
    socketDisconnectListeners.forEach((x) => x());
  });

  const getHandler = <Key extends keyof TSocketOutEvents>(k: Key) => {
    return (async (args: TParameters<Key>, callback: TCallback<Key>) => {
      try {
        const res = await controller[k](args);
        callback({ status: "success", data: res });
      } catch (e) {
        logger.error(e);
        callback({ status: "error", error: (e as Error).message });
      }
    }) as TSocketOutEvents[Key];
  };

  (Object.keys(controller) as Array<keyof TSocketOutEvents>).forEach((k) => {
    assert(socket).on<typeof k>(k, getHandler(k));
  });

  socket.on("connect_error", async (err) => {
    logger.error(`connection error due to ${err.message}`);
    socket?.disconnect();
    setTimeout(() => initBridge().catch(logger.error), env.CORE.RECONNECTION_TIMEOUT);
  });

  setMode();
};
