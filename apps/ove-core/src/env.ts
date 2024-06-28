/* global process, __dirname, Buffer */

import { z } from "zod";
import dotenv from "dotenv";
import * as path from "path";
import { nanoid } from "nanoid";
import { createHmac } from "crypto";
import { Logger } from "@ove/ove-logging";
import { setupConfigWithRefinement } from "@ove/ove-server-utils";

dotenv.config();

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the server isn't built with invalid env vars.
 */
const baseSchema = z.strictObject({
  NODE_ENV: z.union([
    z.literal("development"),
    z.literal("production"),
    z.literal("test")
  ]),
  LOG_LEVEL: z.number().optional(),
  LOGGING_SERVER: z.string().optional(),
  PORT: z.number(),
  HOSTNAME: z.string(),
  PROTOCOL: z.string(),
  TOKENS: z.strictObject({
    ACCESS: z.strictObject({
      SECRET: z.string(),
      PASSPHRASE: z.string(),
      EXPIRY: z.string(),
      ISSUER: z.string()
    }),
    REFRESH: z.strictObject({
      SECRET: z.string(),
      PASSPHRASE: z.string(),
      ISSUER: z.string()
    })
  }),
  SOCKET_PATH: z.string().optional(),
  SOCKET_ADMIN: z.strictObject({
    USERNAME: z.string(),
    PASSWORD: z.string()
  }).optional(),
  ASSET_STORE_CONFIG: z.strictObject({
    ACCESS_KEY: z.string(),
    SECRET_KEY: z.string(),
    END_POINT: z.string(),
    PORT: z.number(),
    USE_SSL: z.boolean(),
    GLOBAL_BUCKETS: z.string().array()
  }).optional(),
  CONTROLLER_FORMAT: z.strictObject({
    SERVER: z.string(),
    RENDERER: z.string(),
    DATA_TYPE_MAP: z.record(z.string(), z.string())
  }).optional(),
  DISABLE_AUTH: z.boolean(),
  TEST_USER: z.string().optional(),
  SOCKET_DIST: z.string(),
  THUMBNAIL_GENERATOR: z.string().optional(),
  DATA_FORMATTER: z.string().optional(),
  UI_URL: z.string()
});

const schema = baseSchema.refine(config =>
  (config.NODE_ENV === "test" && config.TEST_USER !== undefined) ||
  !config.DISABLE_AUTH);

const staticConfig = {
  APP_NAME: "ove-core",
  VERSION: "0.1.1",
  API_VERSION: 1,
  TITLE: "next-ove core",
  DESCRIPTION: "The heart of next-ove."
} as const;

const accessTokenPassphrase = nanoid(16);
const accessTokenSecret = Buffer
  .from(createHmac("sha256", accessTokenPassphrase)
    .digest("hex"))
  .toString("base64");

const refreshTokenPassphrase = nanoid(16);
const refreshTokenSecret = Buffer
  .from(createHmac("sha256", refreshTokenPassphrase)
    .digest("hex"))
  .toString("base64");

const defaultConfig: z.infer<typeof schema> = {
  NODE_ENV: process.env.NODE_ENV as "production" | "development" | "test",
  PORT: 3333,
  HOSTNAME: "127.0.0.1",
  PROTOCOL: "http",
  TOKENS: {
    ACCESS: {
      SECRET: accessTokenSecret,
      PASSPHRASE: accessTokenPassphrase,
      ISSUER: staticConfig.APP_NAME,
      EXPIRY: "24h"
    },
    REFRESH: {
      SECRET: refreshTokenSecret,
      PASSPHRASE: refreshTokenPassphrase,
      ISSUER: staticConfig.APP_NAME
    }
  },
  DISABLE_AUTH: false,
  SOCKET_DIST: path.join(__dirname, "..", "..", "..",
    "node_modules", "@socket.io", "admin-ui", "ui", "dist"),
  UI_URL: path.join(__dirname, "ui")
};

const configPath = path.join(__dirname, "config", "config.json");

export const env = setupConfigWithRefinement(
  configPath,
  defaultConfig,
  schema,
  staticConfig,
  Object.keys(baseSchema.shape)
);

export const logger = Logger(env.APP_NAME, env.LOG_LEVEL, env.LOGGING_SERVER);
logger.info(`Loaded configuration from ${configPath}`);
