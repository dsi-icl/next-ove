import { z } from "zod";
import { Logger } from "@ove/ove-logging";
import { assert } from "@ove/ove-utils";

interface ImportMeta {
  env: ImportMetaEnv;
}

interface ImportMetaEnv {
  VITE_BASE_URL: string;
  VITE_CORE_URL: string;
  VITE_LOG_LEVEL?: string;
  VITE_LOGGING_SERVER?: string;
  VITE_VIDEO_STREAM_URL?: string;
  VITE_PROJECT_LAUNCHER: string;
  VITE_MODE: string;
  VITE_DISABLE_AUTH: string;
  VITE_LIVE_FEED_REFRESH: string;
}

const env_ = (import.meta as unknown as ImportMeta).env;

const isConfigured = (key: string | undefined) =>
  key !== undefined && !key.startsWith("NEXT_OVE");

const schema = z.strictObject({
  BASE_URL: z.string(),
  CORE_URL: z.string(),
  PROJECT_LAUNCHER: z.string(),
  LOG_LEVEL: z.number().optional(),
  LOGGING_SERVER: z.string().optional(),
  MODE: z.union([
    z.literal("production"),
    z.literal("development"),
    z.literal("test")
  ]),
  DISABLE_AUTH: z.boolean(), // only disable auth if under test
  LIVE_FEED_REFRESH: z.number()
}).refine(x => x.MODE === "test" || !x.DISABLE_AUTH);

const parsedConfig = schema.parse({
  BASE_URL: env_.VITE_BASE_URL,
  CORE_URL: env_.VITE_CORE_URL,
  PROJECT_LAUNCHER: env_.VITE_PROJECT_LAUNCHER,
  LOG_LEVEL: isConfigured(env_.VITE_LOG_LEVEL) ?
    parseInt(assert(env_.VITE_LOG_LEVEL)) : undefined,
  LOGGING_SERVER: isConfigured(env_.VITE_LOGGING_SERVER) ?
    assert(env_.VITE_LOGGING_SERVER) : undefined,
  MODE: env_.VITE_MODE,
  DISABLE_AUTH: env_.VITE_DISABLE_AUTH === "true",
  LIVE_FEED_REFRESH: parseInt(env_.VITE_LIVE_FEED_REFRESH)
});

const staticConfig = {
  CORE_API_VERSION: 1,
  APP_NAME: "ove-core-ui"
} as const;

export const env = {
  ...parsedConfig,
  ...staticConfig
} as const;

export const logger = Logger(env.APP_NAME, env.LOG_LEVEL, env.LOGGING_SERVER);
