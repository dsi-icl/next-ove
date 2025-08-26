import { deviceHandler, multiDeviceHandler } from "./service";
import {
  BridgeServiceKeys,
  type THardwareClientToServerEvents,
  type THardwareServerToClientEvents,
} from "@ove/ove-types";
import { assert } from "@ove/ove-utils";
import { env, logger } from "../../env";
import { io, type Socket } from "socket.io-client";
import { startReconciliation, stopReconciliation } from "./reconciliation";
import { updateCookie } from "../../utils/auth";
import { getAgent } from "../../utils/agent";

let socket: Socket<
  THardwareServerToClientEvents,
  THardwareClientToServerEvents
> | null = null;

export const closeHardwareSocket = () => {
  if (socket === null) return;
  socket.disconnect();
  socket = null;
};

export const initHardware = async () => {
  if (env.CORE?.URL === undefined || env.AUTH.NAME === undefined) return;
  if (env.RECONCILIATION.STATUS) {
    try {
      startReconciliation();
    } catch (e) {
      logger.info(e);
    }
  } else {
    try {
      stopReconciliation();
    } catch (e) {
      logger.info(e);
    }
  }
  const agent = getAgent();
  socket = io(`${env.CORE.URL}/socket/hardware`, {
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
  });

  socket.on("connect", () => {
    logger.info(`${assert(socket).id} connected to /hardware`);
  });

  socket.on("disconnect", () => {
    logger.info(`${assert(socket).id} disconnected from /hardware`);
  });

  BridgeServiceKeys.forEach((k) => {
    const deviceHandlerInterface = (
      args: Parameters<typeof deviceHandler>[1],
      callback: Parameters<typeof deviceHandler>[2],
    ) => deviceHandler(k, args, callback).then();
    const multiDeviceHandlerInterface = (
      args: Parameters<typeof multiDeviceHandler>[1],
      callback: Parameters<typeof multiDeviceHandler>[2],
    ) => multiDeviceHandler(k, args, callback).then();
    assert(socket).on(
      k,
      deviceHandlerInterface as THardwareServerToClientEvents[typeof k],
    );
    assert(socket).on(
      `${k}All`,
      multiDeviceHandlerInterface as THardwareServerToClientEvents[`${typeof k}All`],
    );
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
