/* global process, __dirname */

import {
  AutoScheduleSchema,
  BoundsSchema,
  CalendarSchema,
  DeviceSchema,
  PowerModeSchema
} from "@ove/ove-types";
import { z } from "zod";
import * as path from "path";
import { nanoid } from "nanoid";
import { Logger } from "@ove/ove-logging";
import { getConfigPath, setupConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  METRICS: z.strictObject({
    HOST: z.string(),
    PORT: z.number(),
  }),
  LOGGING: z
    .strictObject({
      SERVER: z.string(),
      LEVEL: z.number().optional(),
    })
    .optional(),
  CORE: z.strictObject({
    SOCKET_PATH: z.string().optional(),
    URL: z.string(),
    ACK_TIMEOUT: z.number(),
    RECONNECTION_TIMEOUT: z.number(),
  }),
  CALENDAR: z
    .strictObject({
      URL: z.string().optional(),
      DATA: CalendarSchema.optional(),
    })
    .optional(),
  POWER: z.strictObject({
    MODE: PowerModeSchema,
    SCHEDULE: AutoScheduleSchema,
  }),
  AUTH: z.strictObject({
    NAME: z.string(),
    API_KEY: z.string(),
  }),
  RECONCILIATION: z.strictObject({
    TIMEOUT: z.number(),
    STATUS: z.boolean(),
  }),
  HARDWARE: z.strictObject({
    DEVICES: z.array(DeviceSchema),
    GEOMETRY: BoundsSchema.optional(),
    WOL_ADDRESS: z.string().optional(),
    TIMEOUTS: z.strictObject({
      NODE: z.number(),
      MDC: z.number(),
      PJLINK: z.number(),
      MDC_RESTART: z.number(),
    }),
    SCRIPTS: z
      .strictObject({
        PING: z.string().optional(), // include %IP% for IP replacement
        SYN_SCAN: z.string().optional(), // include %IP% for IP replacement
        ARP_SCAN: z.string().optional(), // include %IP% for IP replacement
        START_NODE: z.string().optional(),
      })
      .optional(),
  }),
  LIVE_VIEW: z
    .strictObject({
      SOURCES: z.array(z.string()).optional(),
      SCRIPTS: z
        .strictObject({
          START: z.string().optional(),
          STOP: z.string().optional(),
          STATUS: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

const staticConfig = {
  APP_NAME: "ove-bridge",
  UI_ALIAS: "ove-bridge-ui",
  CLIENT_API_VERSION: "1",
  CORE_API_VERSION: "2",
} as const;

const apiKey = nanoid(16);

const defaultConfig: z.infer<typeof schema> = {
  METRICS: {
    HOST: "127.0.0.1",
    PORT: 9100,
  },
  CORE: {
    URL: "http://localhost:3333",
    RECONNECTION_TIMEOUT: 500,
    ACK_TIMEOUT: 60000,
  },
  AUTH: {
    NAME: "ove-bridge",
    API_KEY: apiKey,
  },
  POWER: {
    MODE: "manual",
    SCHEDULE: {
      wake: null,
      sleep: null,
      schedule: [false, false, false, false, false, false, false],
    },
  },
  HARDWARE: {
    DEVICES: [],
    TIMEOUTS: {
      NODE: 5_000,
      MDC: 5_000,
      MDC_RESTART: 1_000,
      PJLINK: 5_000,
    },
  },
  RECONCILIATION: {
    TIMEOUT: 60_000,
    STATUS: true,
  },
};

export type Environment = z.infer<typeof schema> & typeof staticConfig;

const configPath = getConfigPath(
  path.join(
    __dirname,
    "..",
    "..",
    "..",
    "apps",
    "ove-bridge",
    "config",
    "config.json",
  ),
  path.join(__dirname, "config", "config.json"),
);

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);
export const logger = Logger(
  env.APP_NAME,
  env.LOGGING?.LEVEL,
  env.LOGGING?.SERVER,
);
export const version = process.env.npm_package_version ?? "UNKNOWN-VERSION";

logger.info(`Loaded configuration from ${configPath}`);
