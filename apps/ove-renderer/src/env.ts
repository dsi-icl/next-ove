import { z } from "zod";
import { Logger } from "@ove/ove-logging";
import { assert } from "@ove/ove-utils";

interface ImportMeta {
  env: ImportMetaEnv;
}

interface ImportMetaEnv {
  VITE_SOCKET_URL: string;
  VITE_SOCKET_PATH: string;
  VITE_LOGGING_IDENTIFIER?: string;
  VITE_LOG_LEVEL?: string;
  VITE_LOGGING_SERVER?: string;
  VITE_CORE_SERVER: string;
}

const env_ = (import.meta as unknown as ImportMeta).env;

const isConfigured = (key: string | undefined) =>
  key !== undefined && !key.startsWith("NEXT_OVE");

const schema = z
  .strictObject({
    CORE: z.strictObject({
      SERVER: z.string(),
    }),
    SOCKETS: z.strictObject({
      URL: z.string(),
      PATH: z.string().optional(),
    }),
    LOGGING: z
      .strictObject({
        LOG_LEVEL: z.number().optional(),
        SERVER: z.string().optional(),
        IDENTIFIER: z.string().optional(),
      })
      .optional(),
  })

const parsedConfig = schema.parse({
  CORE: {
    SERVER: env_.VITE_CORE_SERVER,
  },
  SOCKETS: {
    URL: env_.VITE_SOCKET_URL,
    PATH: env_.VITE_SOCKET_PATH,
  },
  LOGGING: {
    LOG_LEVEL: isConfigured(env_.VITE_LOG_LEVEL)
      ? parseInt(assert(env_.VITE_LOG_LEVEL))
      : undefined,
    SERVER: env_.VITE_LOGGING_SERVER,
    IDENTIFIER: env_.VITE_LOGGING_IDENTIFIER,
  },
});

const staticConfig = {
  CORE_API_VERSION: 2,
  APP_NAME: "ove-renderer",
} as const;

export const env = {
  ...parsedConfig,
  ...staticConfig,
} as const;

export const logger = Logger(
  env.APP_NAME,
  env.LOGGING?.IDENTIFIER,
  env.LOGGING?.LOG_LEVEL,
  env.LOGGING?.SERVER,
);
