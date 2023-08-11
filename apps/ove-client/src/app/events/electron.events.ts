/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, ipcMain, type IpcMain } from "electron";
import { inboundChannels, InboundAPI } from "@ove/ove-client-shared";
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

const IPCService: InboundAPI = {
  getAppVersion: async () => app.getVersion(),
  getInfo: async type => Service().getInfo(type)
};

(Object.keys(inboundChannels) as Array<keyof InboundAPI>).forEach(k => {
  ipcMain.handle(inboundChannels[k], (_event, ...args) =>
    IPCService[k](...args));
});

// Handle App termination
ipcMain.on("quit", (_, code) => {
  app.exit(code);
});
