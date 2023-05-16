/* global console */

import {
  BridgeAPIType, BridgeServiceKeys,
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
import {z} from "zod";

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

  BridgeServiceKeys.forEach(k => {
    // @ts-ignore
    socket.on(k, async (args: z.infer<BridgeAPIType[typeof k]["args"]>, cb: (response: z.infer<BridgeAPIType[typeof k]["bridge"]>) => void) => {
      // @ts-ignore
      Service[k](args, cb);
    });
  });

  DeviceServiceKeys.forEach(k => {
    socket.on(k, (args: z.infer<BridgeAPIType[typeof k]["args"]>, callback: (response: z.infer<BridgeAPIType[typeof k]["bridge"]>) => void) => {
      deviceHandler(k, args, callback).then(() => console.log(`Handled: ${k}`));
    });
    socket.on(`${k}All`, (args: z.infer<BridgeAPIType[`${typeof k}All`]["args"]>, callback: (response: z.infer<BridgeAPIType[`${typeof k}All`]["bridge"]>) => void) => {
      multiDeviceHandler(k, args, callback).then(() => console.log(`Handled: ${k}All`));
    });
  });

  socket.on("connect_error", err =>
    console.error(`connect_error due to ${err.message}`)
  );
};
