/* global console */

/**
 * This module is responsible on handling all the inter process communications
 * between the frontend to the electron backend.
 */
import * as schedule from "node-schedule";
import { app, ipcMain, type IpcMain } from "electron";
import { environment } from "../../environments/environment";
import { API, channels } from "@ove/ove-bridge-shared";
import { envPath, readAsset, toAsset, writeEnv } from "@ove/file-utils";
import { CalendarEvent, Device } from "@ove/ove-types";
import min from "date-fns/min";
import subHours from "date-fns/subHours";
import addHours from "date-fns/addHours";
import max from "date-fns/max";
import {
  closeHardwareSocket,
  env,
  initEnv,
  initHardware
} from "@ove/ove-bridge-lib";

export const bootstrapElectronEvents = (): IpcMain => ipcMain;

process.on("SIGINT", () => {
  schedule.gracefulShutdown().then(() => process.exit(0));
});

const updateEnv = (newEnv: typeof env) => {
  Object.keys(newEnv).filter(key => key !== "NODE_ENV").forEach(key => {
    process.env[key] = newEnv[key as keyof typeof env];
  });

  writeEnv(newEnv);
  initEnv(envPath);
};

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
    updateEnv({...env, CORE_URL: coreURL, BRIDGE_NAME: bridgeName});
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
  },
  setAutoSchedule: async (autoSchedule) => {
    updateEnv({...env, POWER_MODE: "auto"});
    await schedule.gracefulShutdown();
    console.log(JSON.stringify(autoSchedule));
    schedule.scheduleJob(new Date(Date.now() + 5000), () => console.log("Triggered Auto"));
  },
  setEcoSchedule: async (ecoSchedule) => {
    console.log(`Setting eco schedule for ${ecoSchedule.length} events!`);
    updateEnv({...env, POWER_MODE: "eco"});
    const groups = Object.values(ecoSchedule.reduce((acc, event) => {
      const key = `${event.start.getDate()}-${event.start.getMonth() + 1}-${event.start.getFullYear()}`;
        if (Object.keys(acc).includes(key)) {
          acc[key as keyof typeof acc].push(event);
        } else {
          acc[key as keyof typeof acc] = [event];
        }
      return acc;
    }, {} as {[key: string]: CalendarEvent[]})).map((group) => {
      const start = subHours(min(group.map(event => event.start)).setMinutes(0, 0, 0), 1);
      const end = addHours(max(group.map(event => event.end)).setMinutes(0, 0, 0), 2);
      return {
        start,
        end
      }
    });
    await schedule.gracefulShutdown();

    groups.forEach(({start, end}, i) => {
      // TODO: replace with hardware calls
      // TODO: schedule poll on calendar
      schedule.scheduleJob(new Date(Date.now() + (3_000 * (i + 1))), () => console.log(`Triggered for ${start.toISOString()}`));
      schedule.scheduleJob(new Date(Date.now() + (5_000 * (i + 1))), () => console.log(`Triggered for ${end.toISOString()}`));
    });
  },
  clearSchedule: async () => {
    updateEnv({...env, POWER_MODE: "manual"});
    schedule.gracefulShutdown().catch(console.error);
  },
  getMode: async () => env.POWER_MODE
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
