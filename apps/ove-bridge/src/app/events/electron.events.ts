/* global console */

/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */

import { app, ipcMain, type IpcMain } from "electron";
import { environment } from "../../environments/environment";
import { API, channels } from "@ove/ove-bridge-shared";
import { envPath, readAsset, toAsset, writeEnv } from "@ove/file-utils";
import { Device } from "@ove/ove-types";
import {
  closeHardwareSocket,
  env,
  initEnv,
  initHardware
} from "@ove/ove-bridge-lib";

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
  },
  updateEnv: async (coreURL, bridgeName) => {
    process.env.CORE_URL = coreURL;
    process.env.BRIDGE_NAME = bridgeName;
    writeEnv({...env, CORE_URL: coreURL, BRIDGE_NAME: bridgeName});
    initEnv(envPath);
    closeHardwareSocket();
    initHardware();
  },
  getEnv: async () => ({bridgeName: env.BRIDGE_NAME, coreURL: env.CORE_URL}),
  getDevices: async () => readAsset("hardware.json") as Device[],
  saveDevice: async (device: Device) => {
    const devices = readAsset("hardware.json") as Device[];
    const existingDevice = devices.findIndex(({id}) => id === device.id);
    if (existingDevice === -1) {
      devices.push(device);
    } else {
      devices[existingDevice] = device;
    }

    toAsset("hardware.json", devices, true);
  },
  deleteDevice: async deviceId => {
    toAsset("hardware.json", (readAsset("hardware.json") as Device[]).filter(({id}) => id !== deviceId), true);
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
