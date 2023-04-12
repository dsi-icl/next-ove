/* global console require */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dateFormat = require("dateformat");
import * as chalk from "chalk";
import Constants from "./ove-constants";
import { LogLevel } from "./types";


export const logger = (name?: string, logLevel?: number) => {
  const logLevel_ = logLevel ?? Constants.DEFAULT_LOG_LEVEL;
  const name_: string = name ?? Constants.UNKNOWN_APP_ID;

  const getLogLabel = (logLevel: LogLevel) => chalk
    .bgHex(logLevel.label.bgColor)
    .hex(logLevel.label.color)
    .bold;

  const buildLogMessage = (logLevel: LogLevel, ...args: string[]): string[] => {
    const whitespace = logLevel.name.length === 4 ? " " : "";
    const logLabel = getLogLabel(logLevel)(`[${logLevel.name}]`);
    const date = dateFormat(new Date(), "dd/mm/yyyy, h:MM:ss.l tt");
    const paddedName = name_.padEnd(Constants.APP_LOG_ID_WIDTH);
    return [whitespace + logLabel, date, "-", paddedName, ":"]
      .concat(Object.values(args));
  };

  const log = (level: LogLevel, ...args: string[]): void => {
    if (logLevel_ > level.level) return;
    const message = buildLogMessage(level, ...args);
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
    name: name_,
    getLogLabel: getLogLabel,
    buildLogMessage: buildLogMessage,
    fatal: (...args: string[]) => log(Constants.LogLevels["fatal"], ...args),
    error: (...args: string[]) => log(Constants.LogLevels["error"], ...args),
    warn: (...args: string[]) => log(Constants.LogLevels["warn"], ...args),
    info: (...args: string[]) => log(Constants.LogLevels["info"], ...args),
    debug: (...args: string[]) => log(Constants.LogLevels["debug"], ...args),
    trace: (...args: string[]) => log(Constants.LogLevels["trace"], ...args)
  };
};

