import {
  AutoScheduleSchema,
  CalendarSchema,
  DeviceSchema,
  PowerModeSchema
} from "@ove/ove-types";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as path from "path";
import { app } from "electron";
import { Logger } from "@ove/ove-logging";
import { generateKeyPairSync } from "crypto";
import { DeepProxy } from "@ove/ove-utils";
import { saveConfig, updateConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  LOGGING_SERVER: z.string().optional(),
  RENDER_CONFIG: z.strictObject({
    PORT: z.number(),
    HOSTNAME: z.string(),
    PROTOCOL: z.string()
  }),
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
} as const;

const passPhrase = nanoid(16);

const { publicKey, privateKey } = generateKeyPairSync("rsa", {
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
  PASSPHRASE: passPhrase,
  RENDER_CONFIG: {
    PROTOCOL: "http",
    HOSTNAME: "localhost",
    PORT: 4200
  }
};

const configPath = path.join(app.getPath("userData"), "ove-bridge-config.json");

const config = updateConfig(
  configPath,
  defaultConfig,
  Object.keys(schema.shape)
);

if (config === null) throw new Error("Unable to load environment configuration");
const {rawConfig, isUpdate} = config;

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