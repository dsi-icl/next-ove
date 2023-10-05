import { z } from "zod";
import { Logger } from "@ove/ove-logging";

// noinspection JSUnusedLocalSymbols
interface ImportMeta {
  env: {
    VITE_BASE_URL: string
    VITE_CORE_URL: string
    VITE_LOG_LEVEL?: number
    VITE_LOGGING_SERVER?: string
    VITE_VIDEO_STREAM_URL?: string
    VITE_PROJECT_LAUNCHER: string
  };
}

const schema = z.strictObject({
  BASE_URL: z.string(),
  CORE_URL: z.string(),
  PROJECT_LAUNCHER: z.string(),
  LOG_LEVEL: z.number().optional(),
  LOGGING_SERVER: z.string().optional(),
  VIDEO_STREAM_URL: z.string().optional()
});

const parsedConfig = schema.parse({
  BASE_URL: import.meta.env.VITE_BASE_URL,
  CORE_URL: import.meta.env.VITE_CORE_URL,
  PROJECT_LAUNCHER: import.meta.env.VITE_PROJECT_LAUNCHER,
  LOG_LEVEL: import.meta.env.VITE_LOG_LEVEL !== undefined ? parseInt(import.meta.env.VITE_LOG_LEVEL) : undefined,
  LOGGING_SERVER: import.meta.env.VITE_LOGGING_SERVER,
  VIDEO_STREAM_URL: import.meta.env.VITE_VIDEO_STREAM_URL
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