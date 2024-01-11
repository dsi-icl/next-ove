/* global console, fetch */

import chalk from "chalk";
import format from "date-fns/format";
import { default as Constants } from "./constants";

export type LogLevel = {
  name: string
  consoleLogger: string
  level: number
  label: {
    bgColor: string
    color: string
  }
}

export const Logger = (
  name?: string,
  logLevel?: number,
  loggingServerURL?: string
) => {
  const logLevel_ = logLevel ?? Constants.DEFAULT_LOG_LEVEL;
  const name_: string = name ?? Constants.UNKNOWN_APP_ID;

  const getLogLabel = (logLevel: LogLevel) => chalk
    .bgHex(logLevel.label.bgColor)
    .hex(logLevel.label.color)
    .bold;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildLogMessage = (logLevel: LogLevel, ...args: any[]): string[] => {
    const whitespace = logLevel.name.length === 4 ? " " : "";
    const logLabel = getLogLabel(logLevel)(`[${logLevel.name}]`);
    const date = format(new Date(), "dd/MM/yyyy, HH:mm:ss");
    const paddedName = name_.padEnd(Constants.APP_LOG_ID_WIDTH);
    return [whitespace + logLabel, date, "-", paddedName, ":"]
      .concat(Object.values(args));
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const log = (level: LogLevel, ...args: any[]): void => {
    if (logLevel_ > level.level) return;

    const message = buildLogMessage(level, ...args);

    if (loggingServerURL !== undefined) {
      // fails silently
      fetch(loggingServerURL, {
        method: "POST",
        body: message.join(" ")
      }).catch(() => {
      });
    }

    switch (level.consoleLogger) {
      case "error":
        console.error(...message);
        break;
      case "warn":
        console.warn(...message);
        break;
      case "info":
        console.info(...message);
        break;
      case "log":
        console.log(...message);
        break;
      case "trace":
        console.trace(...message);
        break;
    }
  };

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fatal: (...args: any[]) => log(Constants.LogLevels["fatal"], ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: (...args: any[]) => log(Constants.LogLevels["error"], ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    warn: (...args: any[]) => log(Constants.LogLevels["warn"], ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    info: (...args: any[]) => log(Constants.LogLevels["info"], ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debug: (...args: any[]) => log(Constants.LogLevels["debug"], ...args),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    trace: (...args: any[]) => log(Constants.LogLevels["trace"], ...args)
  };
};

export type TLogger = ReturnType<typeof Logger>
