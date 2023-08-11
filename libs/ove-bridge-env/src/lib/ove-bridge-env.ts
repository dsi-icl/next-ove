import { z } from "zod";
import {
  AutoScheduleSchema,
  CalendarSchema,
  DeviceSchema,
  PowerModeSchema
} from "@ove/ove-types";
import { nanoid } from "nanoid";
import * as path from "path";
import { app } from "electron";
import { Json } from "@ove/ove-utils";
import { Logger } from "@ove/ove-logging";
import { generateKeyPairSync } from "crypto";
import { readFile, safeWriteFile } from "@ove/file-utils";

const schema = z.strictObject({
  LOGGING_SERVER: z.string().optional(),
  RENDER_CONFIG: z.strictObject({
    PORT: z.number(),
    HOSTNAME: z.string(),
    PROTOCOL: z.string()
  }).optional(),
  LOG_LEVEL: z.number().optional(),
  CORE_URL: z.string().optional(),
  BRIDGE_NAME: z.string().optional(),
  POWER_MODE: PowerModeSchema,
  HARDWARE: z.array(DeviceSchema),
  CALENDAR_URL: z.string().optional(),
  CALENDAR: CalendarSchema.optional(),
  AUTO_SCHEDULE: AutoScheduleSchema.optional(),
  PRIVATE_KEY: z.string(),
  PUBLIC_KEY: z.string(),
  PASSPHRASE: z.string()
});

const staticConfig = {
  APP_NAME: "ove-bridge",
  UI_ALIAS: "ove-bridge-ui",
  CLIENT_VERSION: "1"
};

const passPhrase = nanoid(16);

const {publicKey, privateKey} = generateKeyPairSync("rsa", {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: "spki",
    format: "pem"
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase: passPhrase
  }
});

const defaultConfig: z.infer<typeof schema> = {
  POWER_MODE: "manual",
  HARDWARE: [],
  PUBLIC_KEY: publicKey,
  PRIVATE_KEY: privateKey,
  PASSPHRASE: passPhrase
};

const configPath = path.join(app.getPath("userData"), "ove-bridge-config.json");

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