/* global process */

import { z } from "zod";
import * as path from "path";
import { app } from "electron";
import { nanoid } from "nanoid";
import { Logger } from "@ove/ove-logging";
import { setupConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  LOGGING: z
    .strictObject({
      SERVER: z.string().optional(),
      LEVEL: z.number().optional(),
    })
    .optional(),
  SERVER: z.strictObject({
    HOSTNAME: z.string(),
    PORT: z.number(),
    PROTOCOL: z.discriminatedUnion("TYPE", [
      z.strictObject({
        TYPE: z.literal("http"),
      }),
      z.strictObject({
        TYPE: z.literal("https"),
        KEY: z.string(),
        CERTIFICATE: z.string(),
        CA: z.string(),
      }),
    ]),
  }),
  AUTH: z.strictObject({
    STORED_CREDENTIALS: z.string().optional(),
    ERROR_LIMIT: z.number(),
    HOSTNAME_WHITELIST: z.string().array().optional(),
    PIN_UPDATE_DELAY: z.number(),
    API_KEY: z.string(),
    SERVER_URL: z.string(),
  }),
  RENDERER: z.discriminatedUnion("MODE", [
    z.strictObject({
      MODE: z.literal("legacy"),
      WINDOW_CONFIG: z.record(z.string(), z.string()),
      BROWSER_DELAY: z.number(),
    }),
    z.strictObject({
      MODE: z.literal("nuovo"),
      BROWSER_DELAY: z.number(),
      ENDPOINT: z.string(),
    }),
  ]),
});

const staticConfig = {
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
    PROTOCOL: { TYPE: "http" },
  },
  AUTH: {
    ERROR_LIMIT: 3,
    PIN_UPDATE_DELAY: 30_000,
    API_KEY: apiKey,
    SERVER_URL: "http://localhost:3333",
  },
  RENDERER: {
    WINDOW_CONFIG: {},
    BROWSER_DELAY: 2000,
    MODE: "legacy",
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
  env.LOGGING?.LEVEL,
  env.LOGGING?.SERVER,
);
logger.info(`Loaded configuration from ${configPath}`);
