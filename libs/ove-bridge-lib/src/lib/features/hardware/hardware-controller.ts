import {
  deviceHandler,
  multiDeviceHandler,
} from "./service";
import {
  DeviceServiceKeys,
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
} from "@ove/ove-types";
import { assert } from "@ove/ove-utils";
import { io, Socket } from "socket.io-client";
import { env, logger } from "@ove/ove-bridge-env";

let socket: Socket<
  HardwareServerToClientEvents,
  HardwareClientToServerEvents
> | null = null;

export const closeHardwareSocket = () => {
  if (socket === null) return;
  socket.disconnect();
  socket = null;
};

export const initHardware = () => {
  if (env.CORE_URL === undefined || env.BRIDGE_NAME === undefined) return;
  socket = io(`ws://${env.CORE_URL}/hardware`, { autoConnect: false });
  socket.auth = {
    username: env.BRIDGE_NAME,
    password: env.PUBLIC_KEY
  };
  socket.connect();

  socket.on("connect", () => {
    logger.info(`${assert(socket).id} connected to /hardware`);
  });

  socket.on("disconnect", () => {
    console.log(`${assert(socket).id} disconnected from /hardware`);
  });


  DeviceServiceKeys.forEach(k => {
    const deviceHandlerInterface = (args: Parameters<typeof deviceHandler>[1], callback: Parameters<typeof deviceHandler>[2]) => deviceHandler(k, args, callback).then(() => logger.info(`Handled: ${k}`));
    const multiDeviceHandlerInterface = (args: Parameters<typeof multiDeviceHandler>[1], callback: Parameters<typeof multiDeviceHandler>[2]) => multiDeviceHandler(k, args, callback).then(() => logger.info(`Handled: ${k}All`));
    assert(socket).on(k, deviceHandlerInterface as HardwareServerToClientEvents[typeof k]);
    assert(socket).on(`${k}All`, multiDeviceHandlerInterface as HardwareServerToClientEvents[`${typeof k}All`]);
  });

  socket.on("connect_error", err => logger.error(`connection error due to ${err.message}`));
};