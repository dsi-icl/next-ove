import {
  deviceHandler,
  multiDeviceHandler
} from "./service";
import {
  BridgeServiceKeys,
  type THardwareClientToServerEvents,
  type THardwareServerToClientEvents
} from "@ove/ove-types";
import { assert } from "@ove/ove-utils";
import { env, logger } from "../../../../env";
import { io, type Socket } from "socket.io-client";
import { startReconciliation, stopReconciliation } from "./reconciliation";

let socket: Socket<
  THardwareServerToClientEvents,
  THardwareClientToServerEvents
> | null = null;

export const closeHardwareSocket = () => {
  if (socket === null) return;
  socket.disconnect();
  socket = null;
};

export const initHardware = () => {
  if (env.CORE_URL === undefined || env.BRIDGE_NAME === undefined) return;
  if (env.RECONCILE) {
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
  socket = io(`${env.CORE_URL}/socket/hardware`, {
    autoConnect: false,
    path: env.SOCKET_PATH
  });
  socket.auth = {
    username: env.BRIDGE_NAME,
    password: env.PUBLIC_KEY
  };
  socket.connect();

  socket.on("connect", () => {
    logger.info(`${assert(socket).id} connected to /hardware`);
  });

  socket.on("disconnect", () => {
    logger.info(`${assert(socket).id} disconnected from /hardware`);
  });

  BridgeServiceKeys.forEach(k => {
    const deviceHandlerInterface = (
      args: Parameters<typeof deviceHandler>[1],
      callback: Parameters<typeof deviceHandler>[2]
    ) => deviceHandler(k, args, callback).then();
    const multiDeviceHandlerInterface = (
      args: Parameters<typeof multiDeviceHandler>[1],
      callback: Parameters<typeof multiDeviceHandler>[2]
    ) => multiDeviceHandler(k, args, callback)
      .then();
    assert(socket).on(k, deviceHandlerInterface as
      THardwareServerToClientEvents[typeof k]);
    assert(socket).on(`${k}All`, multiDeviceHandlerInterface as
      THardwareServerToClientEvents[`${typeof k}All`]);
  });

  socket.on("connect_error", err =>
    logger.error(`connection error due to ${err.message}`));
};
