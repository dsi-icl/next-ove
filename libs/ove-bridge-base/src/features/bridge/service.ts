import type {
  Calendar,
  TBridgeService
} from "@ove/ove-types";
import {
  setAutoSchedule,
  setEcoSchedule,
  setManualSchedule
} from "./power-scheduler";
import fetch from "node-fetch";
import {
  startReconciliation,
  stopReconciliation
} from "../hardware/reconciliation";
import {
  service as ReconciliationService
} from "../hardware/reconciliation-service";
import { raise } from "@ove/ove-utils";
import { execSync } from "child_process";
import { createClient } from "../hardware/node-service";
import { closeSocket, getSocketStatus } from "./sockets";
import { closeHardwareSocket } from "../hardware/hardware-controller";
import { env, logger, version } from "../../env";

let initBridge_: (() => void) | null = null;
let initHardware_: (() => void) | null = null;

export const initService = (
  initBridge: () => void,
  initHardware: () => void,
) => {
  initBridge_ = initBridge;
  initHardware_ = initHardware;
};

export const service: TBridgeService = {
  getDevice: async ({ deviceId }) =>
    env!.HARDWARE.find(({ id }) => id === deviceId) ??
    raise(`No device with id: ${deviceId}`),
  getDevices: async ({ tag }) => tag === undefined ?
    env!.HARDWARE : env!.HARDWARE.filter(({ tags }) => tags.includes(tag)),
  addDevice: async ({ device }) => {
    env!.HARDWARE.push(device);
    ReconciliationService.update();
    return true;
  },
  removeDevice: async ({ deviceId }) => {
    env!.HARDWARE = env!.HARDWARE.filter(({ id }) => id !== deviceId);
    ReconciliationService.update();
    return true;
  },
  startStreams: async () => {
    if (env!.START_VIDEO_SCRIPT === undefined) return true;
    try {
      execSync(env!.START_VIDEO_SCRIPT);
      return true;
    } catch (e) {
      logger!.error(e);
      return false;
    }
  },
  stopStreams: async () => {
    if (env!.STOP_VIDEO_SCRIPT === undefined) return true;
    try {
      execSync(env!.STOP_VIDEO_SCRIPT);
      return true;
    } catch (e) {
      logger!.error(e);
      return false;
    }
  },
  getStreams: async () => env!.VIDEO_STREAMS,
  getCalendar: async () => {
    // TODO: add full production integration with email service, Azure auth etc.
    if (env!.CALENDAR_URL === undefined) return undefined;
    try {
      const raw = await (await fetch(env!.CALENDAR_URL)).json();
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
      env!.CALENDAR = calendar;
      return calendar;
    } catch (e) {
      logger!.error(e);
      return undefined;
    }
  },
  getSocketStatus: async () => getSocketStatus(),
  getMode: async () => env!.POWER_MODE,
  setMode: async ({ mode }) => {
    env!.POWER_MODE = mode;
    return true;
  },
  setManualSchedule: async () => void setManualSchedule(),
  setEcoSchedule: async ({ ecoSchedule }) =>
    void setEcoSchedule(ecoSchedule).catch(logger!.error),
  setAutoSchedule: async ({ autoSchedule }) =>
    void setAutoSchedule(autoSchedule).catch(logger!.error),
  getEnv: async () => ({
    bridgeName: env!.BRIDGE_NAME,
    coreURL: env!.CORE_URL,
    calendarURL: env!.CALENDAR_URL,
    reconcile: env!.RECONCILE
  }),
  updateEnv: async ({ bridgeName, coreURL, calendarURL, reconcile }) => {
    if (initHardware_ === null || initBridge_ === null) return;
    env!.CORE_URL = coreURL;
    env!.BRIDGE_NAME = bridgeName;
    env!.CALENDAR_URL = calendarURL;
    env!.RECONCILE = reconcile;
    closeHardwareSocket();
    closeSocket();
    initHardware_();
    initBridge_();
    return undefined;
  },
  registerAuth: async ({ id, pin }) => {
    const idx = env!.HARDWARE.findIndex(device => device.id == id);
    if (idx === -1) throw new Error(`Unknown device with id: ${id}`);

    try {
      await createClient(env!.HARDWARE[idx]).register.mutate({
        pin,
        key: env!.PUBLIC_KEY
      });
    } catch (e) {
      logger!.error(e);
    }

    env!.HARDWARE[idx].auth = true;
    return undefined;
  },
  getDevicesToAuth: async () => env!.HARDWARE.filter(device => device.auth === null),
  getAppVersion: async () => version!,
  getPublicKey: async () => env!.PUBLIC_KEY,
  getAutoSchedule: async () => env!.AUTO_SCHEDULE,
  getGeometry: async () => env!.GEOMETRY,
  getReconciliation: async () => env!.RECONCILE,
  refreshReconciliation: async () => {
    if (!env!.RECONCILE) return false;
    stopReconciliation();
    startReconciliation();
    return true;
  },
  startReconciliation: async () => {
    startReconciliation();
    env!.RECONCILE = true;
    return true;
  },
  stopReconciliation: async () => {
    stopReconciliation();
    env!.RECONCILE = false;
    return true;
  }
};
