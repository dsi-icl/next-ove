/* global process */

import { Json } from "@ove/ove-utils";
import { env, logger } from "../../env";
import * as schedule from "node-schedule";
import { multiDeviceHandler } from "../hardware/service";
import type { PowerMode } from "@ove/ove-types";
import ical from "node-ical";
import { nanoid } from "nanoid";

let calendarRefresh: NodeJS.Timeout | number | undefined = undefined;

/**
 * Cancel only jobs created by this module
 */
const cancelOwnJobs = () => {
  for (const name in schedule.scheduledJobs) {
    if (
      name.startsWith("start-") ||
      name.startsWith("end-") ||
      name.startsWith("auto-wake-") ||
      name.startsWith("auto-sleep-")
    ) {
      schedule.scheduledJobs[name].cancel();
    }
  }
};

const logSchedule = () => {
  const { nextStart, nextStop } = getSchedule();
  logger.info("Next scheduled start time:", nextStart ?? "-");
  logger.info("Next scheduled stop time:", nextStop ?? "-");
};

export const setMode = (mode?: PowerMode) => {
  if (mode !== undefined) {
    env.POWER.MODE = mode;
  }

  switch (env.POWER.MODE) {
    case "manual": {
      logger.info("Setting manual mode");
      clearInterval(calendarRefresh);
      cancelOwnJobs();
      logSchedule();
      break;
    }

    case "auto": {
      logger.info("Setting auto mode");
      clearInterval(calendarRefresh);
      setAutoSchedule().then(logSchedule).catch(logger.error);
      break;
    }

    case "eco": {
      logger.info("Setting eco mode");
      setEcoSchedule().then(logSchedule).catch(logger.error);

      if (env.CALENDAR?.REFRESH_INTERVAL !== undefined) {
        clearInterval(calendarRefresh);
        calendarRefresh = setInterval(() => {
          logger.info("Updating eco mode");
          setEcoSchedule().then(logSchedule).catch(logger.error);
        }, env.CALENDAR.REFRESH_INTERVAL);
      }
      break;
    }
  }
};

export const updateCalendar = async () => {
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

  const now = Date.now();

  const events = [...events_]
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start))
    // Allow events already started but not yet ended
    .filter(({ end }) => Date.parse(end) > now);

  if (events.length === 0) return [];

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
  cancelOwnJobs();

  const ecoSchedule = env.CALENDAR?.DATA?.value ?? [];
  const groups = groupEvents(ecoSchedule);
  const now = Date.now();

  groups.forEach(({ start, end }) => {
    if (start.getTime() > now) {
      logger.trace("Scheduling start for", start.toISOString());
      schedule.scheduleJob(`start-${nanoid(8)}`, start, () => {
        if (process.env.NODE_ENV === "development") {
          logger.info(`Triggered start ${start.toISOString()}`);
          return;
        }

        multiDeviceHandler("start", {}, (response) =>
          logger.info(
            `Started devices with response:\n${Json.stringify(response)}`,
          ),
        )
          .then(() => logger.info("Completed startup on schedule"))
          .catch((e) =>
            logger.error("Failed to complete startup on schedule:", e),
          );
      });
    }

    if (end.getTime() > now) {
      logger.trace("Scheduling stop for", end.toISOString());
      schedule.scheduleJob(`end-${nanoid(8)}`, end, () => {
        if (process.env.NODE_ENV === "development") {
          logger.info(`Triggered stop ${end.toISOString()}`);
          return;
        }

        multiDeviceHandler("shutdown", {}, (response) =>
          logger.info(
            `Stopped devices with response:\n${Json.stringify(response)}`,
          ),
        )
          .then(() => logger.info("Completed shutdown on schedule"))
          .catch((e) =>
            logger.error("Failed to complete shutdown on schedule:", e),
          );
      });
    }
  });
};

const setAutoSchedule = async (): Promise<void> => {
  cancelOwnJobs();

  const autoSchedule = env.POWER.SCHEDULE;

  if (autoSchedule.wake !== null) {
    const [wakeHour, wakeMinute] = autoSchedule.wake
      .split(":")
      .map((x) => parseInt(x, 10));

    autoSchedule.schedule.forEach((enabled, i) => {
      if (!enabled) return;

      schedule.scheduleJob(
        `auto-wake-${i}`,
        {
          dayOfWeek: i,
          hour: wakeHour,
          minute: wakeMinute,
        },
        () => {
          if (process.env.NODE_ENV === "development") {
            logger.info("Waking");
            return;
          }

          multiDeviceHandler("start", {}, (response) =>
            logger.info(
              `Started devices with response:\n${Json.stringify(response)}`,
            ),
          );
        },
      );
    });
  }

  if (autoSchedule.sleep !== null) {
    const [sleepHour, sleepMinute] = autoSchedule.sleep
      .split(":")
      .map((x) => parseInt(x, 10));

    autoSchedule.schedule.forEach((enabled, i) => {
      if (!enabled) return;

      schedule.scheduleJob(
        `auto-sleep-${i}`,
        {
          dayOfWeek: i,
          hour: sleepHour,
          minute: sleepMinute,
        },
        () => {
          if (process.env.NODE_ENV === "development") {
            logger.info("Sleeping");
            return;
          }

          multiDeviceHandler("shutdown", {}, (response) =>
            logger.info(
              `Shutdown devices with response:\n${Json.stringify(response)}`,
            ),
          );
        },
      );
    });
  }
};

export const getSchedule = () => {
  let nextStart: Date | null = null;
  let nextStop: Date | null = null;

  for (const name in schedule.scheduledJobs) {
    const job = schedule.scheduledJobs[name];
    const invocation = job.nextInvocation();
    if (invocation === null) continue;

    const date = (invocation as unknown as { toDate: () => Date }).toDate();

    if (name.startsWith("start-")) {
      if (nextStart === null || date < nextStart) {
        nextStart = date;
      }
    }

    if (name.startsWith("end-")) {
      if (nextStop === null || date < nextStop) {
        nextStop = date;
      }
    }
  }

  return { nextStart, nextStop };
};

/**
 * Graceful shutdown on process termination
 */
const shutdown = async () => {
  logger.info("Gracefully shutting down scheduler");
  await schedule.gracefulShutdown();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
