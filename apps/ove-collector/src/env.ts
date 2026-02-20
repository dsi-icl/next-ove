/* global __dirname */

import { z } from "zod";
import * as path from "path";
import { getConfigPath, setupConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  SERVER: z.strictObject({
    PORT: z.coerce.number(),
  }),
  CLICKHOUSE: z.strictObject({
    CA_PATH: z.string().optional(),
    URL: z.string(),
    USER: z.string().optional(),
    PASSWORD: z.string().optional(),
    DATABASE: z.string(),
    TIMEOUT: z.number().optional(),
  }),
  PROJECTS: z.strictObject({
    publicKey: z.string(),
    projectId: z.string(),
  }).array(),
  API: z.strictObject({
    BUFFER: z.strictObject({
      FLUSH_INTERVAL_MS: z.number(),
      BATCH_SIZE: z.number(),
    }),
    RATE_LIMIT: z.strictObject({
      MAX_EVENTS_PER_REQUEST: z.number(),
      WINDOW_MS: z.coerce.number(),
      LIMIT: z.coerce.number(),
      STANDARD_HEADERS: z.union([
        z.boolean(),
        z.literal("draft-6"),
        z.literal("draft-7"),
      ]),
      LEGACY_HEADERS: z.boolean(),
    }),
  }),
});

const staticConfig = {
  APP_NAME: "ove-collector",
};

const defaultConfig: z.infer<typeof schema> = {
  SERVER: {
    PORT: 8080,
  },
  CLICKHOUSE: {
    URL: "http://localhost:8123",
    DATABASE: "analytics_events",
  },
  PROJECTS: [],
  API: {
    BUFFER: {
      FLUSH_INTERVAL_MS: 1000,
      BATCH_SIZE: 20,
    },
    RATE_LIMIT: {
      MAX_EVENTS_PER_REQUEST: 100,
      WINDOW_MS: 60_000,
      LIMIT: 1_000,
      STANDARD_HEADERS: "draft-7",
      LEGACY_HEADERS: false,
    },
  },
};

const configPath = getConfigPath(
  path.join(
    __dirname,
    "..",
    "..",
    "..",
    "apps",
    "ove-collector",
    "config",
    "config.json",
  ),
  path.join(__dirname, "config", "config.json"),
);

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);
