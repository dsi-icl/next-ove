/* global __dirname */

import { z } from "zod";
import * as path from "path";
import { getConfigPath, setupConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  _config: z.strictObject({
    base_path: z.string().optional(),
    healthcheck_timeout: z.number(),
    timeout: z.number(),
    port: z.number(),
    host: z.string(),
    running: z.string(),
    logging: z.union([z.literal("on"), z.literal("off")]),
    auth: z
      .strictObject({
        server: z.string(),
        key: z.string(),
      })
      .optional(),
    publicDir: z.string().optional(),
  }),
  routes: z.record(
    z.string().refine((k) => k !== "_config"),
    z.strictObject({
      up: z.string(),
      down: z.string(),
      location: z.string(),
      displayName: z.string(),
      assetPath: z.string().optional(),
      healthcheck: z.string().optional(),
    }),
  ),
});

const staticConfig = {
  APP_NAME: "ove-demo-manager",
};

const defaultConfig: z.infer<typeof schema> = {
  _config: {
    healthcheck_timeout: 1000,
    timeout: 3600,
    port: 3000,
    host: "127.0.0.1",
    running: "",
    logging: "on",
    publicDir: "../public",
    auth: {
      server: "AUTH SERVER URL - COOKIE VALIDATION ENDPOINT",
      key: "API KEY",
    },
  },
  routes: {
    "demo-1": {
      up: "echo demo 1 going up",
      down: "echo demo 1 going down",
      location: ".",
      displayName: "Demo 01"
    },
    "demo-2": {
      up: "echo demo 2 going up",
      down: "echo demo 2 going down",
      location: ".",
      displayName: "Demo 02"
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
    "ove-demo-manager",
    "config",
    "config.json",
  ),
  path.join(__dirname, "config", "config.json"),
);

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);
