import { z } from "zod";
import * as path from "path";
import { app } from "electron";
import { Logger } from "@ove/ove-logging";
import { DeepProxy } from "@ove/ove-utils";
import { saveConfig, updateConfig } from "@ove/ove-env-utils";

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
  LOG_LEVEL: z.number().optional(),
  AUTHORISED_CREDENTIALS: z.array(z.string())
});

const staticConfig = {
  API_VERSION: 1,
  APP_NAME: "ove-client",
  UI_ALIAS: "ove-client-ui",
  PIN_UPDATE_DELAY: 30_000
} as const;

const defaultConfig: z.infer<typeof schema> = {
  AUTHORISED_CREDENTIALS: [],
  PORT: 3334,
  HOSTNAME: "localhost",
  PROTOCOL: "http",
  RENDER_CONFIG: {
    PORT: 4201,
    HOSTNAME: "localhost",
    PROTOCOL: "http"
  }
};

const configPath = path.join(app.getPath("userData"), "ove-client-config.json");

const { rawConfig, isUpdate } = updateConfig(
  configPath,
  defaultConfig,
  Object.keys(schema.shape)
);

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