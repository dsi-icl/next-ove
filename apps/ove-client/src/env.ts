import { z } from "zod";
import * as path from "path";
import { app } from "electron";
import { Logger } from "@ove/ove-logging";
import { setupConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  LOGGING_SERVER: z.string().optional(),
  HOSTNAME: z.string(),
  PORT: z.number(),
  PROTOCOL: z.string(),
  RENDER_CONFIG: z.strictObject({
    PORT: z.number(),
    HOSTNAME: z.string(),
    PROTOCOL: z.string()
  }),
  BRIDGE_URL: z.string().optional(),
  LOG_LEVEL: z.number().optional(),
  AUTHORISED_CREDENTIALS: z.string().optional(),
  AUTH_ERROR_LIMIT: z.number()
});

const staticConfig = {
  API_VERSION: 1,
  APP_NAME: "ove-client",
  UI_ALIAS: "ove-client-ui",
  PIN_UPDATE_DELAY: 30_000,
  TITLE: "next-ove client",
  DESCRIPTION: "Control interface for observatory rendering nodes.",
  CHECKSITE: "www.google.com",
} as const;

const defaultConfig: z.infer<typeof schema> = {
  PORT: 3334,
  HOSTNAME: "localhost",
  PROTOCOL: "http",
  RENDER_CONFIG: {
    PORT: 4201,
    HOSTNAME: "localhost",
    PROTOCOL: "http"
  },
  AUTH_ERROR_LIMIT: 3
};

const configPath = path.join(app.getPath("userData"), "ove-client-config.json");

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);

export const logger = Logger(env.APP_NAME, env.LOG_LEVEL, env.LOGGING_SERVER);
logger.info(`Loaded configuration from ${configPath}`);
