/* global Proxy, process, console */

import { z } from "zod";
import * as path from "path";
import { Logger } from "@ove/ove-logging";
import { DeepProxy } from "@ove/ove-utils";
import { saveConfig, updateConfig } from "@ove/ove-server-utils";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const schema = z.strictObject({
  LOG_LEVEL: z.number().optional(),
  LOGGING_SERVER: z.string().optional(),
  PORT: z.number(),
  HOSTNAME: z.string(),
  PROTOCOL: z.string(),
  ACCESS_TOKEN_SECRET: z.string().optional(),
  REFRESH_TOKEN_SECRET: z.string().optional()
});

const staticConfig = {
  APP_NAME: "ove-core",
  VERSION: "0.0.0",
  API_VERSION: 1,
  TITLE: "next-ove core",
  DESCRIPTION: "The heart of next-ove."
} as const;

const defaultConfig: z.infer<typeof schema> = {
  PORT: 3333,
  HOSTNAME: "127.0.0.1",
  PROTOCOL: "http"
};

const configPath = path.join(__dirname, "config.json");

const config = updateConfig(
  configPath,
  defaultConfig,
  Object.keys(schema.shape)
);

if (config === null) throw new Error("Unable to load environment configuration");
const { rawConfig, isUpdate } = config;

type Environment = z.infer<typeof schema> & typeof staticConfig

export const env: Environment = DeepProxy({
  ...schema.parse(rawConfig),
  ...staticConfig
}, target => saveConfig(configPath, target, Object.keys(staticConfig)));

if (isUpdate) {
  saveConfig(configPath, env, Object.keys(staticConfig));
}

export const logger = Logger(env.APP_NAME, env.LOG_LEVEL, env.LOGGING_SERVER);
logger.info(`Loaded configuration from ${configPath}`);
