/* global __dirname */

import { z } from "zod";
import * as path from "path";
import { nanoid } from "nanoid";
import { getConfigPath, setupConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  PORT: z.number(),
  S3: z.strictObject({
    ENDPOINT: z.string(),
    ACCESS_KEY: z.string(),
    SECRET_KEY: z.string(),
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
  PORT: 8080,
  S3: {
    ENDPOINT: "localhost:9000",
    ACCESS_KEY: "",
    SECRET_KEY: "",
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
