/* global console */

import {
  BridgeServiceKeys,
  DeviceServiceKeys,
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
} from "@ove/ove-types";
import { env } from "../../environments/env";
import { io, Socket } from "socket.io-client";
import {
  deviceHandler,
  multiDeviceHandler,
  Service
} from "./service";
import { readAsset } from "@ove/file-utils";

let socket: Socket<
  HardwareServerToClientEvents,
  HardwareClientToServerEvents
> | null = null;

export const closeHardwareSocket = () => {
  if (socket === null) return;
  socket.disconnect();
  socket = null;
};

const socketConnectListeners: (() => void)[] = [];
const socketDisconnectListeners: (() => void)[] = [];

export const registerSocketConnectedListener = (listener: () => void) => {
  socketConnectListeners.push(listener);
};

export const registerSocketDisconnectListener = (listener: () => void) => {
  socketDisconnectListeners.push(listener);
};

export const getSocketStatus = () => socket?.connected ?? false;

export const initHardware = () => {
  if (env.CORE_URL === "" || env.BRIDGE_NAME === "") return;
  socket = io(`ws://${env.CORE_URL}/hardware`, { autoConnect: false });
  socket.auth = {
    username: env.BRIDGE_NAME,
    password: readAsset("public_key")
  };
  socket.connect();

  socket.on("connect", () => {
    console.log("Connected to /hardware");
    console.log(socket!!.id);
    socketConnectListeners.forEach(x => x());
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from /hardware");
    console.log(socket!!.id);
    socketDisconnectListeners.forEach(x => x());
  });

  BridgeServiceKeys.forEach(k => {
    socket!!.on(k, Service[k]);
  });


  DeviceServiceKeys.forEach(k => {
    const deviceHandlerInterface = (args: Parameters<typeof deviceHandler>[1], callback: Parameters<typeof deviceHandler>[2]) => deviceHandler(k, args, callback).then(() => console.log(`Handled: ${k}`));
    const multiDeviceHandlerInterface = (args: Parameters<typeof multiDeviceHandler>[1], callback: Parameters<typeof multiDeviceHandler>[2]) => multiDeviceHandler(k, args, callback).then(() => console.log(`Handled: ${k}All`));
    socket!!.on(k, deviceHandlerInterface as HardwareServerToClientEvents[typeof k]);
    socket!!.on(`${k}All`, multiDeviceHandlerInterface as HardwareServerToClientEvents[`${typeof k}All`]);
  });

  socket.on("connect_error", err => console.error(`connect_error due to ${err.message}`));
};