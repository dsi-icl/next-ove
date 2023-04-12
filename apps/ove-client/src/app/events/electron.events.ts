/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

/* global console */

import { app, ipcMain, type IpcMain } from "electron";
import { environment } from "../../environments/environment";

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

// Retrieve app version
ipcMain.handle("get-app-version", () => {
  console.log(`Fetching application version... [v${environment.version}]`);

  return environment.version;
});

// Handle App termination
ipcMain.on("quit", (_, code) => {
  app.exit(code);
});
