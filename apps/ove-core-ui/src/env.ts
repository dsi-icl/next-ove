import { z } from "zod";
import { Logger } from "@ove/ove-logging";
import { LogLevel } from "@ove/ove-types";

interface ImportMeta {
  env: ImportMetaEnv;
}

interface ImportMetaEnv {
  VITE_BASE_URL: string;
  VITE_CORE_URL: string;
  VITE_LOG_LEVEL?: string;
  VITE_VIDEO_STREAM_URL?: string;
  VITE_MODE: string;
  VITE_DISABLE_AUTH: string;
  VITE_LIVE_UPDATE_REFRESH_INTERVAL: string;
  VITE_PAGE_SIZE: string;
  VITE_LOGGING_HOSTNAME?: string;
  VITE_DISABLE_LIVE_PREVIEW: string;
  VITE_API_CALL_OFFSET: string;
  VITE_OTEL_COLLECTOR_URL?: string;
  VITE_ANALYTICS_COLLECTOR_ENDPOINT?: string;
  VITE_ANALYTICS_COLLECTOR_API_KEY?: string;
  VITE_LOGGING_COLLECTOR_ENDPOINT?: string;
  VITE_LOGGING_COLLECTOR_API_KEY?: string;
  VITE_SOCKET_URL?: string;
  VITE_SOCKET_PATH?: string;
  VITE_DEMO_MANAGER_URL?: string;
}

const env_ = (import.meta as unknown as ImportMeta).env;

const isConfigured = (key: string | undefined) =>
  key !== undefined && !key.startsWith("NEXT_OVE");

const formatConfigured = (key: string | undefined) => isConfigured(key) ? key : undefined;

const schema = z
  .strictObject({
    BASE_URL: z.string(),
    CORE_URL: z.string(),
    SOCKETS: z.strictObject({
      URL: z.string(),
      PATH: z.string().optional(),
    }).optional(),
    COLLECTORS: z.strictObject({
      ANALYTICS: z.strictObject({
        ENDPOINT: z.string(),
        API_KEY: z.string(),
      }).optional(),
      LOGGING: z.strictObject({
        ENDPOINT: z.string(),
        API_KEY: z.string(),
      }).optional(),
      OTEL: z.string().optional(),
    }).optional(),
    DEMO_MANAGER_URL: z.string().optional(),
    LOGGING: z
      .strictObject({
        LEVEL: LogLevel.optional(),
        HOSTNAME: z.string().optional(),
      })
      .optional(),
    PAGE_SIZE: z.number(),
    MODE: z.union([
      z.literal("production"),
      z.literal("development"),
      z.literal("test"),
    ]),
    DISABLE_AUTH: z.boolean(), // only disable auth if under test
    LIVE_UPDATE_REFRESH_INTERVAL: z.number(),
    DISABLE_LIVE_PREVIEW: z.boolean(),
    API_CALL_OFFSET: z.number(),
  })
  .refine((x) => x.MODE === "test" || !x.DISABLE_AUTH);

const parsedConfig = schema.parse({
  BASE_URL: env_.VITE_BASE_URL,
  CORE_URL: env_.VITE_CORE_URL,
  DEMO_MANAGER_URL: formatConfigured(env_.VITE_DEMO_MANAGER_URL),
  LOGGING: {
    LEVEL: formatConfigured(env_.VITE_LOG_LEVEL) ?? "info",
    HOSTNAME: formatConfigured(env_.VITE_LOGGING_HOSTNAME),
  },
  SOCKETS: {
    URL: formatConfigured(env_.VITE_SOCKET_URL) ?? env_.VITE_CORE_URL,
    PATH: formatConfigured(env_.VITE_SOCKET_PATH),
  },
  COLLECTORS: {
    ANALYTICS: env_.VITE_ANALYTICS_COLLECTOR_ENDPOINT ? {
      ENDPOINT: formatConfigured(env_.VITE_ANALYTICS_COLLECTOR_ENDPOINT),
      API_KEY: formatConfigured(env_.VITE_ANALYTICS_COLLECTOR_API_KEY),
    } : undefined,
    LOGGING: env_.VITE_LOGGING_COLLECTOR_ENDPOINT ? {
      ENDPOINT: formatConfigured(env_.VITE_LOGGING_COLLECTOR_ENDPOINT),
      API_KEY: formatConfigured(env_.VITE_LOGGING_COLLECTOR_API_KEY),
    } : undefined,
    OTEL: formatConfigured(env_.VITE_OTEL_COLLECTOR_URL),
  },
  MODE: env_.VITE_MODE,
  DISABLE_AUTH: env_.VITE_DISABLE_AUTH === "true",
  LIVE_UPDATE_REFRESH_INTERVAL: parseInt(env_.VITE_LIVE_UPDATE_REFRESH_INTERVAL),
  PAGE_SIZE: parseInt(env_.VITE_PAGE_SIZE),
  DISABLE_LIVE_PREVIEW: env_.VITE_DISABLE_LIVE_PREVIEW === "true",
  API_CALL_OFFSET: parseInt(env_.VITE_API_CALL_OFFSET),
});

const staticConfig = {
  SOURCE: "browser",
  CORE_API_VERSION: 2,
  APP_NAME: "ove-core-ui",
  CONSTANTS: {
    SPECIAL_FILES: {
      CONTROLLER: "control.html",
      ENV: "env.json",
    },
    STATE_TAB_TRANSITION: 100,
    DEFAULT_STATE: "__default__",
    NEW_STATE_PREFIX: "__new__",
    DRAG_SENSITIVITY: {
      X: 0.01,
      Y: 0.02,
    },
    NEW_PROJECT_ID_LENGTH: 32,
    IMAGE_EXTENSION_REGEX: /.*(?:png|jpg|jpeg|PNG|JPG|JPEG)$/g,
  },
} as const;

export const env = {
  ...parsedConfig,
  ...staticConfig,
} as const;

export const logger = Logger(
  env.APP_NAME,
  env.LOGGING?.HOSTNAME ?? "unknown",
  env.SOURCE,
  env.LOGGING?.LEVEL ?? "info",
  env.COLLECTORS?.LOGGING ? {
    endpoint: env.COLLECTORS.LOGGING.ENDPOINT,
    apiKey: env.COLLECTORS.LOGGING.API_KEY,
  } : undefined,
);
