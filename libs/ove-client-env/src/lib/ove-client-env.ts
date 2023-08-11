import { z } from "zod";
import * as path from "path";
import { app } from "electron";
import { Json } from "@ove/ove-utils";
import { Logger } from "@ove/ove-logging";
import { readFile, safeWriteFile } from "@ove/file-utils";

const schema = z.strictObject({
  LOGGING_SERVER: z.string().optional(),
  HOSTNAME: z.string().optional(),
  PORT: z.number().optional(),
  PROTOCOL: z.string().optional(),
  RENDER_CONFIG: z.strictObject({
    PORT: z.number(),
    HOSTNAME: z.string(),
    PROTOCOL: z.string()
  }).optional(),
  LOG_LEVEL: z.number().optional(),
  AUTHORISED_CREDENTIALS: z.array(z.string())
});

const staticConfig = {
  API_VERSION: 1,
  APP_NAME: "ove-client",
  UI_ALIAS: "ove-client-ui",
  PIN_UPDATE_DELAY: 30_000
};

const defaultConfig: z.infer<typeof schema> = {
  AUTHORISED_CREDENTIALS: []
};

const configPath = path.join(app.getPath("userData"), "ove-client-config.json");

const rawConfig: Record<string, unknown> = readFile(configPath, Json.stringify(defaultConfig));

let updateConfig = false;

for (let key of Object.keys(defaultConfig)) {
  if (key in rawConfig) continue;
  updateConfig = true;
  rawConfig[key as keyof typeof defaultConfig] = defaultConfig[key as keyof typeof defaultConfig];
}

export const env = {
  ...schema.parse(rawConfig),
  ...staticConfig
};

/**
 * Only updates env on application reload.
 * @param updatedEnv
 */
export const saveEnv = (updatedEnv: typeof env) => {
  safeWriteFile(configPath, Json.stringify(updatedEnv), true);
};

if (updateConfig) {
  saveEnv(env);
}

export const logger = Logger(env.APP_NAME, env.LOG_LEVEL, env.LOGGING_SERVER);
logger.info(`Loaded configuration from ${configPath}`);