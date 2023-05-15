/* global console */

import {
  DeviceServiceKeys,
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
} from "@ove/ove-types";
import { env } from "../../environments/env";
import { io, Socket } from "socket.io-client";
import {
  addDevice,
  deviceHandler, getDevice, getDevices,
  multiDeviceHandler, removeDevice,
  wrapCallback
} from "./service";

export default () => {
  console.log(`connecting to - ws://${env.CORE_URL}/hardware`);
  const socket: Socket<
    HardwareServerToClientEvents,
    HardwareClientToServerEvents
  > = io(`ws://${env.CORE_URL}/hardware`, { autoConnect: false });
  socket.auth = { name: `${env.BRIDGE_NAME}` };
  socket.connect();
  console.log(`Testing: ${env.CORE_URL}`);

  socket.on("connect", () => {
    console.log("Connected");
    console.log(socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
    console.log(socket.id);
  });

  socket.on("getDevice", async (args, cb) => {
    wrapCallback(cb)(await getDevice(args));
  });

  socket.on("getDevices", async (args, cb) => {
    wrapCallback(cb)(await getDevices(args));
  });

  socket.on("addDevice", async (args, cb) => {
    wrapCallback(cb)(await addDevice(args));
  });

  socket.on("removeDevice", async (args, cb) => {
    wrapCallback(cb)(await removeDevice(args));
  });

  DeviceServiceKeys.forEach(k => {
    socket.on(k, async (args, callback) => {
      await deviceHandler(k, args, callback);
    });
    socket.on(`${k}All`, async (args, callback) => {
      await multiDeviceHandler(k, args, callback);
    });
  });

  socket.on("connect_error", err =>
    console.error(`connect_error due to ${err.message}`)
  );
  console.log("Hardware component started!");
};
