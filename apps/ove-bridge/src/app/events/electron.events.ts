/* global console */

/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, ipcMain, type IpcMain } from "electron";
import { environment } from "../../environments/environment";
import { API, channels } from "@ove/ove-bridge-shared";
import { readAsset, toAsset } from "@ove/file-utils";
import { Device } from "@ove/ove-types";

export const bootstrapElectronEvents = (): IpcMain => ipcMain;

const IPCService: API = {
  getAppVersion: async () => environment.version,
  getDevicesToAuth: async () => (readAsset("hardware.json") as Device[]).filter(device => device.auth === null),
  getPublicKey: async () => readAsset("public_key", JSON.stringify([])) as string,
  registerAuth: async (id: string) => {
    const devices = readAsset("hardware.json") as Device[];
    const idx = devices.findIndex(device => device.id == id);
    if (idx === -1) throw new Error(`Unknown device with id: ${id}`);

    devices[idx].auth = true;

    toAsset("hardware.json", devices);
  }
};

(Object.keys(channels) as Array<keyof API>).forEach(k => {
  // !Important: This will not error as correctly typed on client, pass-through is allowed
  // @ts-ignore
  ipcMain.handle(channels[k], (_event, ...args) => IPCService[k](...args));
});

// Handle App termination
ipcMain.on("quit", (event, code) => {
  app.exit(code);
});
