import { deviceHandler, multiDeviceHandler } from "./service";
import {
  BridgeServiceKeys,
  type THardwareClientToServerEvents,
  type THardwareServerToClientEvents,
} from "@ove/ove-types";
import { assert } from "@ove/ove-utils";
import { env, logger } from "../../env";
import { io, type Socket } from "socket.io-client";
import { controller } from "../reconciliation/controller";
import { updateCookie } from "../../utils/auth";

let socket: Socket<
  THardwareServerToClientEvents,
  THardwareClientToServerEvents
> | null = null;

export const closeHardwareSocket = () => {
  if (socket === null) return;
  socket.disconnect();
  socket = null;
};

const initSocket = async () => {
  socket = io(`${env.CORE.URL}/socket/hardware`, {
    auth: {
      username: env.AUTH.NAME,
      password: env.AUTH.API_KEY,
    },
    path: `${env.CORE.SOCKET_PATH ?? ""}/${env.CORE_API_VERSION}`,
    withCredentials: true,
    ackTimeout: env.CORE.ACK_TIMEOUT,
    extraHeaders: {
      Cookie: (await updateCookie()) as unknown as string,
    },
  });

  socket.on("connect", () => {
    logger.info(`${assert(socket).id} connected to /hardware`);
  });

  socket.on("disconnect", async (reason, description) => {
    logger.info(
      `Socket disconnected from /hardware`,
      reason,
      description ?? "",
    );
  });

  BridgeServiceKeys.forEach((k) => {
    const deviceHandlerInterface = (
      args: Parameters<typeof deviceHandler>[1],
      callback: Parameters<typeof deviceHandler>[2],
    ) => deviceHandler(k, args, callback).catch(logger.error);
    const multiDeviceHandlerInterface = (
      args: Parameters<typeof multiDeviceHandler>[1],
      callback: Parameters<typeof multiDeviceHandler>[2],
    ) => multiDeviceHandler(k, args, callback).catch(logger.error);
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
    socket?.disconnect();
    setTimeout(
      () => initSocket().catch(logger.error),
      env.CORE.RECONNECTION_TIMEOUT,
    );
  });
};

export const initHardware = async () => {
  if (env.CORE?.URL === undefined || env.AUTH.NAME === undefined) return;

  controller.start();

  await initSocket();
};
