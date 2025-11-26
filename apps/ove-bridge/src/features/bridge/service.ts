/* global fetch*/

import { getSchedule, setMode, updateCalendar } from "./power-scheduler";
import { controller } from "../reconciliation/controller";
import { assert } from "@ove/ove-utils";
import { execPromise } from "@ove/ove-server-utils";
import { getSocketStatus } from "./sockets";
import { env, logger, version } from "../../env";
import { type TBridgeService } from "@ove/ove-types";

export const service: TBridgeService = {
  getDevice: async ({ deviceId }) => {
    const device = env.HARDWARE.DEVICES.find(({ id }) => id === deviceId);
    if (device === undefined) {
      throw new Error(`Device with id ${deviceId} not found`);
    }
    return device;
  },
  getDevices: async ({ tags }) =>
    tags === undefined
      ? env.HARDWARE.DEVICES
      : env.HARDWARE.DEVICES.filter(({ tags: ts }) =>
          ts.some((t) => tags.includes(t)),
        ),
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
    if (env === null || env.LIVE_VIEW?.SCRIPTS?.STATUS === undefined)
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
    await updateCalendar();
    return env.CALENDAR?.DATA;
  },
  getSocketStatus: async () => getSocketStatus(),
  getMode: async () => env.POWER.MODE,
  setMode: async ({ mode }) => {
    setMode(mode);
    return true;
  },
  setAutoSchedule: async ({ autoSchedule }) => {
    env.POWER.SCHEDULE = autoSchedule;
    return undefined;
  },
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
  getNextScheduled: async () => {
    const { nextStart, nextStop } = getSchedule();
    return {
      nextStart: nextStart?.toISOString() ?? null,
      nextStop: nextStop?.toISOString() ?? null,
    };
  },
};
