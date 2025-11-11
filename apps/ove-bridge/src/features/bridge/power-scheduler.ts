/* global process */

import { Json } from "@ove/ove-utils";
import { env, logger } from "../../env";
import * as schedule from "node-schedule";
import { multiDeviceHandler } from "../hardware/service";
import type { PowerMode } from "@ove/ove-types";
import ical from "node-ical";

let calendarRefresh: NodeJS.Timeout | number | undefined = undefined;

const setManualSchedule = () => {
  schedule.gracefulShutdown().catch(logger.error);
};

export const setMode = (mode?: PowerMode) => {
  if (mode !== undefined) {
    env.POWER.MODE = mode;
  }
  switch (env.POWER.MODE) {
    case "manual": {
      logger.info("Setting manual mode");
      clearInterval(calendarRefresh);
      setManualSchedule();
      break;
    }
    case "auto": {
      logger.info("Setting auto mode");
      clearInterval(calendarRefresh);
      setAutoSchedule().catch(logger.error);
      break;
    }
    case "eco": {
      logger.info("Setting eco mode");
      setEcoSchedule().catch(logger.error);
      if (env.CALENDAR?.REFRESH_INTERVAL !== undefined) {
        calendarRefresh = setInterval(() => {
          logger.info("Updating eco mode");
          setEcoSchedule().catch(logger.error);
        }, env.CALENDAR.REFRESH_INTERVAL);
      }
      break;
    }
  }
};

const updateCalendar = async () => {
  if (env === null || env.CALENDAR?.URL === undefined) return undefined;
  try {
    const res = await fetch(env.CALENDAR.URL);
    if (!res.ok) {
      logger.error(`Fetch error ${res.status}`);
      return undefined;
    }
    const icsText = await res.text();
    const data = ical.parseICS(icsText);

    env.CALENDAR.DATA = {
      value: Object.values(data)
        .filter((item) => item.type === "VEVENT")
        .map((evt) => ({
          title: evt.summary,
          start: evt.start.toISOString(),
          end: evt.end.toISOString(),
        })),
      lastUpdated: new Date().toISOString(),
    };
  } catch (e) {
    logger.error(e);
  }
};

const groupEvents = (events_: { start: string; end: string }[]) => {
  if (events_.length === 0) return [];

  const events = [...events_]
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    .filter(({ start }) => Date.parse(start) > Date.now());

  const groups: { start: Date; end: Date }[] = [];

  let curStart = Date.parse(events[0].start);
  let curEnd = Date.parse(events[0].end);

  for (const event of events) {
    const start = Date.parse(event.start);
    const end = Date.parse(event.end);

    if (start <= curEnd + (env.CALENDAR?.GAP_THRESHOLD ?? 0)) {
      curEnd = Math.max(curEnd, end);
    } else {
      groups.push({
        start: new Date(curStart - (env.CALENDAR?.START_DELTA ?? 0)),
        end: new Date(curEnd + (env.CALENDAR?.END_DELTA ?? 0)),
      });
      curStart = start;
      curEnd = end;
    }
  }

  groups.push({
    start: new Date(curStart - (env.CALENDAR?.START_DELTA ?? 0)),
    end: new Date(curEnd + (env.CALENDAR?.END_DELTA ?? 0)),
  });

  return groups;
};

const setEcoSchedule = async (): Promise<void> => {
  await updateCalendar();
  const ecoSchedule = env.CALENDAR?.DATA?.value ?? [];
  const groups = groupEvents(ecoSchedule);
  await schedule.gracefulShutdown();

  groups.forEach(({ start, end }) => {
    schedule.scheduleJob(start, () => {
      if (process.env.NODE_ENV === "development") {
        logger.info(`Triggered for ${start.toISOString()}`);
      } else {
        multiDeviceHandler("start", {}, (response) =>
          logger.info(`Started devices with response: 
          ${Json.stringify(response)}`),
        );
      }
    });
    schedule.scheduleJob(end, () => {
      if (process.env.NODE_ENV === "development") {
        logger.info(`Triggered for ${end.toISOString()}`);
      } else {
        multiDeviceHandler("shutdown", {}, (response) =>
          logger.info(`Stopped devices with response: 
          ${Json.stringify(response)}`),
        );
      }
    });
  });
};

const setAutoSchedule = async (): Promise<void> => {
  const autoSchedule = env.POWER.SCHEDULE;
  await schedule.gracefulShutdown();

  if (autoSchedule.wake !== null) {
    const wakeHour = parseInt(autoSchedule.wake.split(":")[0]);
    const wakeMinute = parseInt(autoSchedule.wake.split(":")[1]);
    autoSchedule.schedule.forEach((x, i) => {
      if (!x) return;
      schedule.scheduleJob(
        {
          dayOfWeek: i,
          hour: wakeHour,
          minute: wakeMinute,
        },
        () => {
          if (process.env.NODE_ENV === "development") {
            logger.info("Waking");
          } else {
            multiDeviceHandler("shutdown", {}, (response) =>
              logger.info(`Started devices with response: 
            ${Json.stringify(response)}`),
            );
          }
        },
      );
    });
  }

  if (autoSchedule.sleep !== null) {
    const sleepHour = parseInt(autoSchedule.sleep.split(":")[0]);
    const sleepMinute = parseInt(autoSchedule.sleep.split(":")[1]);

    autoSchedule.schedule.forEach((x, i) => {
      if (!x) return;
      schedule.scheduleJob(
        {
          dayOfWeek: i,
          hour: sleepHour,
          minute: sleepMinute,
        },
        () => {
          if (process.env.NODE_ENV === "development") {
            logger.info("Sleeping");
          } else {
            multiDeviceHandler("shutdown", {}, (response) =>
              logger.info(`Shutdown devices with response: 
            ${Json.stringify(response)}`),
            );
          }
        },
      );
    });
  }
};
