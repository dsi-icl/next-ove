/* global process */

/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */
import App from "../app";
import { logger } from "../../env";
import { Json } from "@ove/ove-utils";
import {
  registerSocketConnectedListener,
  registerSocketDisconnectListener
} from "../api/features/bridge/sockets";
import * as schedule from "node-schedule";
import type { InboundAPI } from "@ove/ove-types";
import { inboundChannels } from "../../ipc-routes";
import { app, ipcMain, type IpcMain } from "electron";
import { service } from "../api/features/bridge/service";

export const bootstrapElectronEvents = (): IpcMain => ipcMain;

process.on("SIGINT", () => {
  schedule.gracefulShutdown().then(() => process.exit(0));
});

const IPCService: InboundAPI = Object.entries(service)
  .reduce((acc, [k, route]) => {
    acc[k] = async (args: Parameters<typeof route>[0]) => {
      logger.info(`Handling: ${k}`);
      // @ts-expect-error – arg spread
      const res = await route(args);
      return Array.isArray(res) || typeof res === "object" ?
        Json.copy(res) : res; // fixes error with IPC memory allocation
    };
    return acc;
  }, <{ [key: string]: unknown }>{}) as InboundAPI;

(Object.keys(inboundChannels) as Array<keyof InboundAPI>).forEach(k => {
  ipcMain.handle(inboundChannels[k], (_event, ...args) =>
    // !Important: This will not error as correctly typed on client,
    // pass-through is allowed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    IPCService[k](...args));
});

registerSocketConnectedListener(() => App.triggerIPC.socketConnect());
registerSocketDisconnectListener(() => App.triggerIPC.socketDisconnect());

// Handle App termination
ipcMain.on("quit", (_event, code) => {
  app.exit(code);
});
