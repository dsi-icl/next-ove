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
import { z } from "zod";
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
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from /hardware");
    console.log(socket!!.id);
  });

  BridgeServiceKeys.forEach(k => {
    // @ts-ignore
    socket!!.on(k, async (args: z.infer<BridgeAPIType[typeof k]["args"]>, cb: (response: z.infer<BridgeAPIType[typeof k]["bridge"]>) => void) => {
      // @ts-ignore
      Service[k](args, cb);
    });
  });

  DeviceServiceKeys.forEach(k => {
    socket!!.on(k, (args: z.infer<BridgeAPIType[typeof k]["args"]>, callback: (response: z.infer<BridgeAPIType[typeof k]["bridge"]>) => void) => {
      deviceHandler(k, args, callback).then(() => console.log(`Handled: ${k}`));
    });
    socket!!.on(`${k}All`, (args: z.infer<BridgeAPIType[`${typeof k}All`]["args"]>, callback: (response: z.infer<BridgeAPIType[`${typeof k}All`]["bridge"]>) => void) => {
      multiDeviceHandler(k, args, callback).then(() => console.log(`Handled: ${k}All`));
    });
  });

  socket.on("connect_error", err => console.error(`connect_error due to ${err.message}`));
};
