/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, ipcMain, type IpcMain } from "electron";
import service from "../../server/hardware/controller";
import { inboundChannels, type InboundAPI } from "../../ipc-routes";

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
  getInfo: async type => service.getInfo({ type })
};

(Object.keys(inboundChannels) as Array<keyof InboundAPI>).forEach(k => {
  ipcMain.handle(inboundChannels[k], (_event, ...args) =>
    IPCService[k](...args));
});

// Handle App termination
ipcMain.on("quit", (_, code) => {
  app.exit(code);
});
