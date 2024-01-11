/* global process */

import { env, logger } from "../../../../env";
import * as schedule from "node-schedule";
import { AutoSchedule, CalendarEvent } from "@ove/ove-types";
import subHours from "date-fns/subHours";
import min from "date-fns/min";
import addHours from "date-fns/addHours";
import max from "date-fns/max";
import { multiDeviceHandler } from "../hardware/service";
import { Json } from "@ove/ove-utils";

export const setManualSchedule = () => {
  env.POWER_MODE = "manual";
  schedule.gracefulShutdown().catch(logger.error);
};

export const setEcoSchedule = async (
  ecoSchedule: CalendarEvent[]
): Promise<void> => {
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

  groups.forEach(({ start, end }) => {
    schedule.scheduleJob(start, () => {
      if (process.env.NODE_ENV === "development") {
        logger.info(`Triggered for ${start.toISOString()}`);
      } else {
        multiDeviceHandler("start", {}, response =>
          logger.info(`Started devices with response: 
          ${Json.stringify(response)}`));
      }
    });
    schedule.scheduleJob(end, () => {
      if (process.env.NODE_ENV === "development") {
        logger.info(`Triggered for ${end.toISOString()}`);
      } else {
        multiDeviceHandler("shutdown", {}, response =>
          logger.info(`Stopped devices with response: 
          ${Json.stringify(response)}`));
      }
    });
  });
};

export const setAutoSchedule = async (
  autoSchedule_: AutoSchedule | undefined
): Promise<void> => {
  let autoSchedule: AutoSchedule | undefined = autoSchedule_;
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
      }, () => {
        if (process.env.NODE_ENV === "development") {
          logger.info("Waking");
        } else {
          multiDeviceHandler("shutdown", {}, response =>
            logger.info(`Started devices with response: 
            ${Json.stringify(response)}`));
        }
      });
    });
  }

  if (autoSchedule.sleep !== null) {
    const sleepHour = parseInt(autoSchedule.sleep.split(":")[0]);
    const sleepMinute = parseInt(autoSchedule.sleep.split(":")[1]);

    autoSchedule.schedule.forEach((x, i) => {
      if (!x) return;
      schedule.scheduleJob({
        dayOfWeek: i,
        hour: sleepHour,
        minute: sleepMinute
      }, () => {
        if (process.env.NODE_ENV === "development") {
          logger.info("Sleeping");
        } else {
          multiDeviceHandler("shutdown", {}, response =>
            logger.info(`Shutdown devices with response: 
            ${Json.stringify(response)}`));
        }
      });
    });
  }
};
