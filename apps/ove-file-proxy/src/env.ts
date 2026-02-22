/* global __dirname */

import { z } from "zod";
import * as path from "path";
import { nanoid } from "nanoid";
import { getConfigPath, setupConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  SERVER: z.strictObject({
    PORT: z.number(),
    BASE_PATH: z.string().optional(),
    AUTH: z.strictObject({
      CROSS_ORIGINS: z.string().array(),
      API_KEYS: z.string().array()
    }),
  }),
  S3: z.strictObject({
    ENDPOINT: z.string(),
    ACCESS_KEY: z.string(),
    SECRET_KEY: z.string(),
    REGION: z.string(),
  }),
  COOKIE: z.strictObject({
    JWT_SECRET: z.string(),
    DOMAIN: z.string(),
    EXPIRY: z.string(),
    ID: z.string(),
  }),
});

const staticConfig = {
  APP_NAME: "ove-file-proxy",
};

const defaultConfig: z.infer<typeof schema> = {
  SERVER: {
    PORT: 8080,
    AUTH: {
      CROSS_ORIGINS: ["http://localhost"],
      API_KEYS: [],
    },
  },
  S3: {
    ENDPOINT: "localhost:9000",
    ACCESS_KEY: "",
    SECRET_KEY: "",
    REGION: "us-east-1",
  },
  COOKIE: {
    JWT_SECRET: nanoid(),
    DOMAIN: "localhost:8080",
    EXPIRY: "1h",
    ID: "ove-file-proxy",
  },
};

const configPath = getConfigPath(
  path.join(
    __dirname,
    "..",
    "..",
    "..",
    "apps",
    "ove-file-proxy",
    "config",
    "config.json",
  ),
  path.join(__dirname, "config", "config.json"),
);

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);
