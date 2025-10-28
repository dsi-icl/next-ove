/* global fetch*/

import {
  setAutoSchedule,
  setEcoSchedule,
  setManualSchedule,
} from "./power-scheduler";
import {
  startReconciliation,
  stopReconciliation,
} from "../hardware/reconciliation";
import { assert, raise } from "@ove/ove-utils";
import { execSync } from "child_process";
import { getSocketStatus } from "./sockets";
import { env, logger, version } from "../../env";
import type { Calendar, TBridgeService } from "@ove/ove-types";
import { service as ReconciliationService } from "../hardware/reconciliation-service";

export const service: TBridgeService = {
  getDevice: async ({ deviceId }) =>
    env.HARDWARE.DEVICES.find(({ id }) => id === deviceId) ??
    raise(`No device with id: ${deviceId}`),
  getDevices: async ({ tag }) =>
    tag === undefined
      ? env.HARDWARE.DEVICES
      : env.HARDWARE.DEVICES.filter(({ tags }) => tags.includes(tag)),
  addDevice: async ({ device }) => {
    env.HARDWARE.DEVICES.push(device);
    ReconciliationService.update();
    return true;
  },
  removeDevice: async ({ deviceId }) => {
    env.HARDWARE.DEVICES = env.HARDWARE.DEVICES.filter(
      ({ id }) => id !== deviceId,
    );
    ReconciliationService.update();
    return true;
  },
  startStreams: async () => {
    if (env === null || env.LIVE_VIEW?.SCRIPTS?.START === undefined)
      return true;
    try {
      execSync(env.LIVE_VIEW.SCRIPTS.START);
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  },
  stopStreams: async () => {
    if (env === null || env.LIVE_VIEW?.SCRIPTS?.STOP === undefined) return true;
    try {
      execSync(env.LIVE_VIEW.SCRIPTS.STOP);
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  },
  getStreams: async () => env.LIVE_VIEW?.SOURCES,
  getCalendar: async () => {
    // TODO: add full production integration with email service, Azure auth etc.
    if (env === null || env.CALENDAR?.URL === undefined) return undefined;
    try {
      const raw = await (await fetch(env.CALENDAR.URL)).json();
      const calendar: Calendar = {
        value: raw["value"].map(
          (x: {
            subject: string;
            start: { dateTime: string };
            end: { dateTime: string };
          }) => ({
            title: x.subject,
            start: x.start.dateTime,
            end: x.end.dateTime,
          }),
        ),
        lastUpdated: new Date().toISOString(),
      };
      env.CALENDAR.DATA = calendar;
      return calendar;
    } catch (e) {
      logger.error(e);
      return undefined;
    }
  },
  getSocketStatus: async () => getSocketStatus(),
  getMode: async () => env.POWER.MODE,
  setMode: async ({ mode }) => {
    env.POWER.MODE = mode;
    return true;
  },
  setManualSchedule: async () => void setManualSchedule(),
  setEcoSchedule: async ({ ecoSchedule }) =>
    void setEcoSchedule(ecoSchedule).catch(logger.error),
  setAutoSchedule: async ({ autoSchedule }) =>
    void setAutoSchedule(autoSchedule).catch(logger.error),
  getAppVersion: async () => assert(version),
  getAutoSchedule: async () => env.POWER.SCHEDULE,
  getGeometry: async () => env.HARDWARE.GEOMETRY,
  getReconciliation: async () => env.RECONCILIATION.STATUS,
  refreshReconciliation: async () => {
    if (!env.RECONCILIATION.STATUS) return false;
    stopReconciliation();
    startReconciliation();
    return true;
  },
  startReconciliation: async () => {
    startReconciliation();
    env.RECONCILIATION.STATUS = true;
    return true;
  },
  stopReconciliation: async () => {
    stopReconciliation();
    env.RECONCILIATION.STATUS = false;
    return true;
  },
};
