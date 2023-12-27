import {
  type Calendar,
  type TBridgeService
} from "@ove/ove-types";
import {
  setAutoSchedule,
  setEcoSchedule,
  setManualSchedule
} from "./power-scheduler";
import { app } from "electron";
import fetch from "node-fetch";
import { raise } from "@ove/ove-utils";
import { closeHardwareSocket } from "../hardware/hardware-controller";
import { execSync } from "child_process";
import { env, logger } from "../../../../env";
import { createClient } from "../hardware/node-service";
import { closeSocket, getSocketStatus } from "./sockets";

let initBridge_: (() => void) | null = null;
let initHardware_: (() => void) | null = null;

export const initService = (initBridge: () => void, initHardware: () => void) => {
  initBridge_ = initBridge;
  initHardware_ = initHardware;
};

export const service: TBridgeService = {
  getDevice: ({ deviceId }) => env.HARDWARE.find(({ id }) => id === deviceId) ?? raise(`No device with id: ${deviceId}`),
  getDevices: ({ tag }) => tag === undefined ? env.HARDWARE : env.HARDWARE.filter(({ tags }) => tags.includes(tag)),
  addDevice: ({ device }) => {
    env.HARDWARE.push(device);
    return true;
  },
  removeDevice: ({ deviceId }) => {
    env.HARDWARE = env.HARDWARE.filter(({ id }) => id !== deviceId);
    return true;
  },
  startStreams: () => {
    if (env.START_VIDEO_SCRIPT === undefined) return true;
    try {
      execSync(env.START_VIDEO_SCRIPT);
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  },
  stopStreams: () => {
    if (env.STOP_VIDEO_SCRIPT === undefined) return true;
    try {
      execSync(env.STOP_VIDEO_SCRIPT);
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  },
  getStreams: () => env.VIDEO_STREAMS,
  getCalendar: async () => {
    // TODO: add full production integration with email service, Azure auth etc.
    if (env.CALENDAR_URL === undefined) return undefined;
    try {
      const raw = await (await fetch(env.CALENDAR_URL)).json();
      const calendar: Calendar = {
        value: raw["value"].map((x: {
          subject: string,
          start: { dateTime: string },
          end: { dateTime: string }
        }) => ({
          title: x.subject,
          start: x.start.dateTime,
          end: x.end.dateTime
        })), lastUpdated: new Date().toISOString()
      };
      env.CALENDAR = calendar;
      return calendar;
    } catch (e) {
      console.error(e);
      return undefined;
    }
  },
  getSocketStatus: getSocketStatus,
  getMode: () => env.POWER_MODE,
  setManualSchedule: () => setManualSchedule(),
  setEcoSchedule: ({ ecoSchedule }) => void setEcoSchedule(ecoSchedule).catch(logger.error),
  setAutoSchedule: ({ autoSchedule }) => void setAutoSchedule(autoSchedule).catch(logger.error),
  getEnv: () => ({ bridgeName: env.BRIDGE_NAME, coreURL: env.CORE_URL, calendarURL: env.CALENDAR_URL }),
  updateEnv: ({ bridgeName, coreURL, calendarURL }) => {
    if (initHardware_ === null || initBridge_ === null) return;
    env.CORE_URL = coreURL;
    env.BRIDGE_NAME = bridgeName;
    env.CALENDAR_URL = calendarURL;
    closeHardwareSocket();
    closeSocket();
    initHardware_();
    initBridge_();
  },
  registerAuth: async ({ id, pin }) => {
    const idx = env.HARDWARE.findIndex(device => device.id == id);
    if (idx === -1) throw new Error(`Unknown device with id: ${id}`);

    try {
      await createClient(env.HARDWARE[idx]).register.mutate({
        pin,
        key: env.PUBLIC_KEY
      });
    } catch (e) {
      logger.error(e);
    }

    env.HARDWARE[idx].auth = true;
  },
  getDevicesToAuth: () => env.HARDWARE.filter(device => device.auth === null),
  getAppVersion: () => app.getVersion(),
  getPublicKey: () => env.PUBLIC_KEY,
  getAutoSchedule: () => env.AUTO_SCHEDULE,
  getGeometry: () => env.GEOMETRY
};