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
  VITE_LOGGING_SERVER_INGESTION?: string;
  VITE_VIDEO_STREAM_URL?: string;
  VITE_MODE: string;
  VITE_DISABLE_AUTH: string;
  VITE_LIVE_UPDATE_REFRESH_INTERVAL: string;
  VITE_PAGE_SIZE: string;
  VITE_LOGGING_SERVER_API?: string;
  VITE_LOGGING_SERVER_SOCKET_ENDPOINT?: string;
  VITE_LOGGING_SERVER_SOCKET_PATH?: string;
  VITE_LOGGING_IDENTIFIER?: string;
  VITE_DISABLE_LIVE_PREVIEW: string;
  VITE_API_CALL_OFFSET: string;
}

const env_ = (import.meta as unknown as ImportMeta).env;

const isConfigured = (key: string | undefined) =>
  key !== undefined && !key.startsWith("NEXT_OVE");

const formatConfigured = (key: string | undefined) => isConfigured(key) ? key : undefined;

const schema = z
  .strictObject({
    BASE_URL: z.string(),
    CORE_URL: z.string(),
    LOGGING: z
      .strictObject({
        LOG_LEVEL: z.number().optional(),
        SERVER: z
          .strictObject({
            API_ENDPOINT: z.string(),
            INGESTION: z.string(),
            SOCKET_ENDPOINT: z.string(),
            SOCKET_PATH: z.string().optional(),
          }),
        IDENTIFIER: z.string().optional(),
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
  LOGGING: {
    LOG_LEVEL: isConfigured(env_.VITE_LOG_LEVEL)
      ? parseInt(assert(env_.VITE_LOG_LEVEL))
      : undefined,
    SERVER: isConfigured(env_.VITE_LOGGING_SERVER_API) ? {
      API_ENDPOINT: formatConfigured(env_.VITE_LOGGING_SERVER_API),
      INGESTION: formatConfigured(env_.VITE_LOGGING_SERVER_INGESTION),
      SOCKET_ENDPOINT: formatConfigured(env_.VITE_LOGGING_SERVER_SOCKET_ENDPOINT),
      SOCKET_PATH: formatConfigured(env_.VITE_LOGGING_SERVER_SOCKET_PATH),
    } : undefined,
    IDENTIFIER: formatConfigured(env_.VITE_LOGGING_IDENTIFIER),
  },
  MODE: env_.VITE_MODE,
  DISABLE_AUTH: env_.VITE_DISABLE_AUTH === "true",
  LIVE_UPDATE_REFRESH_INTERVAL: parseInt(env_.VITE_LIVE_UPDATE_REFRESH_INTERVAL),
  PAGE_SIZE: parseInt(env_.VITE_PAGE_SIZE),
  DISABLE_LIVE_PREVIEW: env_.VITE_DISABLE_LIVE_PREVIEW === "true",
  API_CALL_OFFSET: parseInt(env_.VITE_API_CALL_OFFSET),
});

const staticConfig = {
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
  env.LOGGING?.IDENTIFIER,
  env.LOGGING?.LOG_LEVEL,
  env.LOGGING?.SERVER?.INGESTION,
);
