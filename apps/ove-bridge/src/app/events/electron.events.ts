/* global process */

/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */
import * as schedule from "node-schedule";
import { app, ipcMain, type IpcMain } from "electron";
import { type InboundAPI, inboundChannels } from "../../ipc-routes";
import {
  registerSocketConnectedListener,
  registerSocketDisconnectListener,
  registerSocketEventListener
} from "../api/features/bridge/routes";
import App from "../app";
import { IPCService } from "../api/controller";

export const bootstrapElectronEvents = (): IpcMain => ipcMain;

process.on("SIGINT", () => {
  schedule.gracefulShutdown().then(() => process.exit(0));
});

(Object.keys(inboundChannels) as Array<keyof InboundAPI>).forEach(k => {
  ipcMain.handle(inboundChannels[k], (_event, ...args) =>
    // !Important: This will not error as correctly typed on client,
    // pass-through is allowed
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignores
    IPCService[k](...args));
});

registerSocketConnectedListener(() => App.triggerIPC.socketConnect());
registerSocketDisconnectListener(() => App.triggerIPC.socketDisconnect());
registerSocketEventListener("loadVideoStream", args => App.triggerIPC.openVideoStream(args));

// Handle App termination
ipcMain.on("quit", (_event, code) => {
  app.exit(code);
});
