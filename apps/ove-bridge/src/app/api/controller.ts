import { app } from "electron";
import {
  closeHardwareSocket,
  createClient,
  getSocketStatus,
  initHardware
} from "@ove/ove-bridge-lib";
import min from "date-fns/min";
import max from "date-fns/max";
import fetch from "node-fetch";
import subHours from "date-fns/subHours";
import addHours from "date-fns/addHours";
import * as schedule from "node-schedule";
import { InboundAPI } from "@ove/ove-bridge-shared";
import { env, logger } from "@ove/ove-bridge-env";
import { Calendar, CalendarEvent, Device } from "@ove/ove-types";

export const IPCService: InboundAPI = {
  getAppVersion: async () => app.getVersion(),
  getPublicKey: async () => env.PUBLIC_KEY,
  getDevicesToAuth: async () =>
    env.HARDWARE.filter(device => device.auth === null),
  registerAuth: async (id: string, pin: string) => {
    const idx = env.HARDWARE.findIndex(device => device.id == id);
    if (idx === -1) throw new Error(`Unknown device with id: ${id}`);

    try {
      await createClient(env.HARDWARE[idx]).register.mutate({
        pin,
        key: env.PUBLIC_KEY
      });
    } catch (e) {
      return false;
    }

    env.HARDWARE[idx].auth = true;
    return true;
  },
  updateEnv: async (coreURL, bridgeName, calendarURL) => {
    env.CORE_URL = coreURL;
    env.BRIDGE_NAME = bridgeName;
    env.CALENDAR_URL = calendarURL ?? env.CALENDAR_URL;
    closeHardwareSocket();
    initHardware();
  },
  getEnv: async () => {
    return ({
      bridgeName: env.BRIDGE_NAME,
      coreURL: env.CORE_URL,
      calendarURL: env.CALENDAR_URL
    });
  },
  getDevices: async () => env.HARDWARE,
  saveDevice: async (device: Device) => {
    const existingDevice = env.HARDWARE
      .findIndex(({ id }) => id === device.id);
    if (existingDevice === -1) {
      env.HARDWARE.push(device);
    } else {
      env.HARDWARE[existingDevice] = device;
    }
  },
  deleteDevice: async deviceId => {
    env.HARDWARE = env.HARDWARE.filter(({ id }) => id !== deviceId);
  },
  setAutoSchedule: async autoSchedule => {
    if (autoSchedule !== undefined) {
      env.AUTO_SCHEDULE = autoSchedule;
      if (env.POWER_MODE !== "auto") return;
    } else {
      autoSchedule = env.AUTO_SCHEDULE;
    }

    env.POWER_MODE = "auto";
    await schedule.gracefulShutdown();

    if (autoSchedule === undefined) return;

    if (autoSchedule.wake !== null) {
      const wakeHour = parseInt(autoSchedule.wake.split(":")[0]);
      const wakeMinute = parseInt(autoSchedule.wake.split(":")[1]);
      autoSchedule.schedule.forEach((x, i) => {
        if (!x) return;
        schedule.scheduleJob({
          dayOfWeek: i,
          hour: wakeHour,
          minute: wakeMinute
        }, () => logger.info("Waking"));
      });
    }

    if (autoSchedule.sleep !== null) {
      const sleepHour = parseInt(autoSchedule.sleep.split(":")[0]);
      const sleepMinute = parseInt(autoSchedule.sleep.split(":")[1]);

      autoSchedule.schedule.forEach((x, i) => {
        if (!x) return;
        // TODO: replace with hardware call
        schedule.scheduleJob({
          dayOfWeek: i,
          hour: sleepHour,
          minute: sleepMinute
        }, () => logger.info("Sleeping"));
      });
    }
  },
  setEcoSchedule: async ecoSchedule => {
    logger.info(`Setting eco schedule for ${ecoSchedule.length} events!`);
    env.POWER_MODE = "eco";
    const groups =
      Object.values(ecoSchedule.reduce((acc, event) => {
        const date = event.start.getDate();
        const month = event.start.getMonth() + 1;
        const year = event.start.getFullYear();
        const key = `${date}-${month}-${year}`;
        if (Object.keys(acc).includes(key)) {
          acc[key as keyof typeof acc].push(event);
        } else {
          acc[key as keyof typeof acc] = [event];
        }
        return acc;
      }, {} as { [key: string]: CalendarEvent[] })).map(group => {
        const start = subHours(min(group.map(event => event.start))
          .setMinutes(0, 0, 0), 1);
        const end = addHours(max(group.map(event => event.end))
          .setMinutes(0, 0, 0), 2);
        return {
          start,
          end
        };
      });
    await schedule.gracefulShutdown();

    groups.forEach(({ start, end }, i) => {
      // TODO: replace with hardware calls
      // TODO: schedule poll on calendar
      schedule.scheduleJob(
        new Date(Date.now() + (3_000 * (i + 1))),
        () => logger.info(`Triggered for ${start.toISOString()}`)
      );
      schedule.scheduleJob(
        new Date(Date.now() + (5_000 * (i + 1))),
        () => logger.info(`Triggered for ${end.toISOString()}`)
      );
    });
  },
  clearSchedule: async () => {
    env.POWER_MODE = "manual";
    schedule.gracefulShutdown().catch(logger.error);
  },
  getMode: async () => env.POWER_MODE,
  getSocketStatus: async () => getSocketStatus(),
  hasCalendar: async () => env.CALENDAR_URL !== undefined,
  getCalendar: async () => env.CALENDAR,
  updateCalendar: async accessToken => {
    if (env.CALENDAR_URL === undefined) return null;
    try {
      const calendar = await (await fetch(
        env.CALENDAR_URL,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )).json() as Calendar;
      calendar["lastUpdated"] = new Date().toISOString();
      env.CALENDAR = calendar;
      return calendar;
    } catch (_e) {
      return null;
    }
  },
  getAutoSchedule: async () => env.AUTO_SCHEDULE
};
