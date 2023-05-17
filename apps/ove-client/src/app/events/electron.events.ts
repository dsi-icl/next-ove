/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

/* global console */

import { app, ipcMain, type IpcMain } from "electron";
import { environment } from "../../environments/environment";
import { API, channels } from "@ove/ove-client-shared";
import Service from "@ove/ove-client-control";

/**
 * Electron events
 */
export default class ElectronEvents {
  /**
   * Returns IPC process
   * @return {IpcMain}
   */
  static bootstrapElectronEvents(): IpcMain {
    return ipcMain;
  }
}

const IPCService: API = {
  getAppVersion: async () => environment.version,
  getInfo: async type => Service().getInfo(type)
};

(Object.keys(channels) as Array<keyof API>).forEach(k => {
  ipcMain.handle(channels[k], (_event, ...args) => IPCService[k](...args));
});

// Handle App termination
ipcMain.on("quit", (_, code) => {
  app.exit(code);
});
