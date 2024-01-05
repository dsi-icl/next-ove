/* global Proxy, process, console */

import { z } from "zod";
import dotenv from "dotenv";
import * as path from "path";
import {nanoid} from "nanoid";
import {createHmac} from "crypto";
import { Logger } from "@ove/ove-logging";
import { setupConfigWithRefinement } from "@ove/ove-server-utils";

dotenv.config();

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the server isn't built with invalid env vars.
 */
const baseSchema = z.strictObject({
  NODE_ENV: z.union([z.literal("development"), z.literal("production"), z.literal("test")]),
  LOG_LEVEL: z.number().optional(),
  LOGGING_SERVER: z.string().optional(),
  PORT: z.number(),
  HOSTNAME: z.string(),
  PROTOCOL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_PASSPHRASE: z.string(),
  REFRESH_TOKEN_PASSPHRASE: z.string(),
  SOCKET_ADMIN: z.strictObject({USERNAME: z.string(), PASSWORD: z.string()}).optional(),
  ASSET_STORE_CREDENTIALS: z.strictObject({ACCESS_KEY: z.string(), SECRET_KEY: z.string()}).optional(),
  DISABLE_AUTH: z.boolean(),
  TEST_USER: z.string().optional()
});

const schema = baseSchema.refine(config => (config.NODE_ENV === "test" && config.TEST_USER !== undefined) || !config.DISABLE_AUTH);

const staticConfig = {
  APP_NAME: "ove-core",
  VERSION: "0.0.0",
  API_VERSION: 1,
  TITLE: "next-ove core",
  DESCRIPTION: "The heart of next-ove."
} as const;

const accessTokenPassphrase = nanoid(16);
const accessTokenSecret = Buffer.from(createHmac("sha256", accessTokenPassphrase).digest("hex")).toString("base64");

const refreshTokenPassphrase = nanoid(16);
const refreshTokenSecret = Buffer.from(createHmac("sha256", refreshTokenPassphrase).digest("hex")).toString("base64");

const defaultConfig: z.infer<typeof schema> = {
  NODE_ENV: process.env.NODE_ENV,
  PORT: 3333,
  HOSTNAME: "127.0.0.1",
  PROTOCOL: "http",
  ACCESS_TOKEN_PASSPHRASE: accessTokenPassphrase,
  ACCESS_TOKEN_SECRET: accessTokenSecret,
  REFRESH_TOKEN_SECRET: refreshTokenSecret,
  REFRESH_TOKEN_PASSPHRASE: refreshTokenPassphrase,
  DISABLE_AUTH: process.env.NODE_ENV === "test"
};

const configPath = path.join(__dirname, "config", "config.json");

export const env = setupConfigWithRefinement(configPath, defaultConfig, schema, staticConfig, Object.keys(baseSchema.shape));

export const logger = Logger(env.APP_NAME, env.LOG_LEVEL, env.LOGGING_SERVER);
logger.info(`Loaded configuration from ${configPath}`);
