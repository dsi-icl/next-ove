/* global fetch*/

import {
  setAutoSchedule,
  setEcoSchedule,
  setManualSchedule
} from "./power-scheduler";
import ical from "node-ical";
import { controller } from "../reconciliation/controller";
import { assert, raise } from "@ove/ove-utils";
import { execPromise } from "@ove/ove-server-utils";
import { getSocketStatus } from "./sockets";
import { env, logger, version } from "../../env";
import { type Calendar, type TBridgeService } from "@ove/ove-types";

export const service: TBridgeService = {
  getDevice: async ({ deviceId }) =>
    env.HARDWARE.DEVICES.find(({ id }) => id === deviceId) ??
    raise(`No device with id: ${deviceId}`),
  getDevices: async ({ tags }) =>
    tags === undefined
      ? env.HARDWARE.DEVICES
      : env.HARDWARE.DEVICES.filter(({ tags: ts }) => ts.some((t) => tags.includes(t))),
  addDevice: async ({ device }) => {
    env.HARDWARE.DEVICES.push(device);
    controller.reinitialise();
    return true;
  },
  removeDevice: async ({ deviceId }) => {
    env.HARDWARE.DEVICES = env.HARDWARE.DEVICES.filter(
      ({ id }) => id !== deviceId,
    );
    controller.reinitialise();
    return true;
  },
  startStreams: async () => {
    if (env === null || env.LIVE_VIEW?.SCRIPTS?.START === undefined)
      return true;
    try {
      await execPromise(env.LIVE_VIEW.SCRIPTS.START);
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  },
  stopStreams: async () => {
    if (env === null || env.LIVE_VIEW?.SCRIPTS?.STOP === undefined) return true;
    try {
      await execPromise(env.LIVE_VIEW.SCRIPTS.STOP);
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  },
  getStreamStatus: async () => {
    if (
      env === null ||
      env.LIVE_VIEW?.SCRIPTS?.STATUS === undefined
    )
      return false;
    try {
      const res = await execPromise(env.LIVE_VIEW.SCRIPTS.STATUS);
      return res.includes("active (running)");
    } catch (e) {
      return false;
    }
  },
  getStreams: async () => env.LIVE_VIEW?.SOURCES,
  getCalendar: async () => {
    if (env === null || env.CALENDAR?.URL === undefined) return undefined;
    try {
      const res = await fetch(env.CALENDAR.URL);
      if (!res.ok) {
        logger.error(`Fetch error ${res.status}`);
        return undefined;
      }
      const icsText = await res.text();
      const data = ical.parseICS(icsText);
      const calendar: Calendar = {
        value: Object.values(data)
          .filter(item => item.type === "VEVENT")
          .map(evt => ({
            title:   evt.summary,
            start:     evt.start.toISOString(),
            end:       evt.end.toISOString(),
          })),
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
    controller.reinitialise();
    return true;
  },
  startReconciliation: async () => {
    env.RECONCILIATION.STATUS = true;
    return true;
  },
  stopReconciliation: async () => {
    env.RECONCILIATION.STATUS = false;
    return true;
  },
};
