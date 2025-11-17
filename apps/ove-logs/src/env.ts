import { z } from "zod";
import * as path from "path";
import { getConfigPath, setupConfig } from "@ove/ove-server-utils";
import type { Algorithm } from "jsonwebtoken";

const isAlgorithm = (x: unknown): x is Algorithm =>
  typeof x === "string" && x !== "";

const schema = z.strictObject({
  AUTH: z
    .strictObject({
      SERVER_URL: z.string(),
      COOKIE_ID: z.string(),
      JWT_ALGORITHMS: z.custom<Algorithm>(isAlgorithm),
    })
    .optional(),
  SERVER: z.strictObject({
    PORT: z.coerce.number(),
  }),
  API: z.strictObject({
    PAGE_SIZE: z.coerce.number(),
    RATE_LIMIT: z.strictObject({
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
  DB: z.strictObject({
    CLEANUP: z
      .strictObject({
        INTERVAL: z.coerce.number(),
        MAX_SIZE: z.coerce.number(),
        MAX_RECORDS: z.coerce.number(),
      })
      .optional(),
  }),
  SOCKETS: z.strictObject({
    PATH: z.string(),
  }),
});

const staticConfig = {
  APP_NAME: "ove-logs",
};

const defaultConfig: z.infer<typeof schema> = {
  SERVER: {
    PORT: 8080,
  },
  API: {
    PAGE_SIZE: 10,
    RATE_LIMIT: {
      WINDOW_MS: 60_000,
      LIMIT: 1_000,
      STANDARD_HEADERS: "draft-7",
      LEGACY_HEADERS: false,
    },
  },
  DB: {
    CLEANUP: {
      INTERVAL: 900_000,
      MAX_SIZE: 150_000_000,
      MAX_RECORDS: 50_000,
    },
  },
  SOCKETS: {
    PATH: "/sockets",
  },
};

const configPath = getConfigPath(
  path.join(
    __dirname,
    "..",
    "..",
    "..",
    "apps",
    "ove-logs",
    "config",
    "config.json",
  ),
  path.join(__dirname, "config", "config.json"),
);

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);
