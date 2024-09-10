import {
  AutoScheduleSchema, BoundsSchema,
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
import { setupConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  LOGGING_SERVER: z.string().optional(),
  RENDER_CONFIG: z.strictObject({
    PORT: z.number(),
    HOSTNAME: z.string(),
    PROTOCOL: z.string()
  }).optional(),
  SOCKET_PATH: z.string().optional(),
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
  PASSPHRASE: z.string(),
  VIDEO_STREAMS: z.array(z.string()).optional(),
  START_VIDEO_SCRIPT: z.string().optional(),
  STOP_VIDEO_SCRIPT: z.string().optional(),
  GEOMETRY: BoundsSchema.optional(),
  NODE_TIMEOUT: z.number(),
  MDC_TIMEOUT: z.number(),
  PJLINK_TIMEOUT: z.number(),
  MDC_RESTART_TIMEOUT: z.number(),
  RECONCILIATION_TIMEOUT: z.number(),
  SYN_SCAN_COMMAND: z.string().optional(), // include %IP% for IP replacement
  ARP_SCAN_COMMAND: z.string().optional(), // include %IP% for IP replacement
  WOL_ADDRESS: z.string().optional(),
  RECONCILE: z.boolean()
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
  NODE_TIMEOUT: 5_000,
  MDC_TIMEOUT: 5_000,
  MDC_RESTART_TIMEOUT: 1_000,
  PJLINK_TIMEOUT: 5_000,
  RECONCILIATION_TIMEOUT: 60_000,
  RECONCILE: true
};

const configPath = path.join(app.getPath("userData"), "ove-bridge-config.json");

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);

export const logger = Logger(env.APP_NAME, env.LOG_LEVEL, env.LOGGING_SERVER);
logger.info(`Loaded configuration from ${configPath}`);
