/* global process */

import { z } from "zod";
import * as path from "path";
import { app } from "electron";
import { nanoid } from "nanoid";
import { Logger } from "@ove/ove-logging";
import { setupConfig } from "@ove/ove-server-utils";
import { BrowserConfigSchema, LogLevel } from "@ove/ove-types";

const schema = z.strictObject({
  // OTEL configuration has to be loaded directly from process.env
  LOGGING: z
    .strictObject({
      LEVEL: LogLevel.optional(),
      HOSTNAME: z.string().optional(),
    })
    .optional(),
  SERVER: z.strictObject({
    HOSTNAME: z.string(),
    PORT: z.number(),
    EXTERNAL_URL: z.string().optional(),
  }),
  EXTENSIONS: z.strictObject({
    SYNC: z.string().optional(),
  }).optional(),
  AUTH: z.strictObject({
    STORED_CREDENTIALS: z.string().optional(),
    ERROR_LIMIT: z.number(),
    HOSTNAME_WHITELIST: z.string().array().optional(),
    PIN_UPDATE_DELAY: z.number(),
    API_KEY: z.string(),
    SERVER_URL: z.string(),
  }),
  BROWSERS: z.strictObject({
    CONFIG: BrowserConfigSchema,
    DELAY: z.number(),
  }),
});

const staticConfig = {
  SOURCE: "Electron",
  API_VERSION: 1,
  APP_NAME: "ove-client",
  TITLE: "next-ove client",
  DESCRIPTION: "Control interface for observatory rendering nodes.",
  CHECKSITE: "www.google.com",
} as const;

const apiKey = nanoid(16);

const defaultConfig: z.infer<typeof schema> = {
  SERVER: {
    PORT: 3334,
    HOSTNAME: "localhost",
  },
  AUTH: {
    ERROR_LIMIT: 3,
    PIN_UPDATE_DELAY: 30_000,
    API_KEY: apiKey,
    SERVER_URL: "http://localhost:3333",
  },
  BROWSERS: {
    CONFIG: [],
    DELAY: 2000,
  },
};

const configPath =
  process.argv
    .slice(2)
    .find((arg) => arg.startsWith("--configFile="))
    ?.split("=")
    ?.at(-1) ?? path.join(app.getPath("userData"), "ove-client-config.json");

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);
export const logger = Logger(
  env.APP_NAME,
  env.LOGGING?.HOSTNAME ?? "unknown",
  env.SOURCE,
  env.LOGGING?.LEVEL ?? "info",
);
logger.info(`Loaded configuration from ${configPath}`);
