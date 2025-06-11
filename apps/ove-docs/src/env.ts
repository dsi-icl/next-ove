import { z } from "zod";
import * as path from "path";
import { Logger } from "@ove/ove-logging";
import { setupConfig } from "@ove/ove-server-utils";

const schema = z.strictObject({
  LOGGING: z
    .strictObject({
      SERVER: z.string().optional(),
      LEVEL: z.number().optional(),
    })
    .optional(),
  SERVER: z.strictObject({
    PORT: z.number(),
    BASE_PATH: z.string(),
  }),
});

const staticConfig = {
  APP_NAME: "ove-docs",
} as const;

const defaultConfig: z.infer<typeof schema> = {
  SERVER: {
    PORT: 8080,
    BASE_PATH: '',
  },
};

export type Environment = z.infer<typeof schema> & typeof staticConfig;

const configPath =
  process.env.NODE_ENV === "production"
    ? path.join(__dirname, "config", "config.json")
    : path.join(
        __dirname,
        "..",
        "..",
        "..",
        "apps",
        "ove-docs",
        "config",
        "config.json",
      );

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);
export const logger = Logger(
  env.APP_NAME,
  env.LOGGING?.LEVEL,
  env.LOGGING?.SERVER,
);
export const version = process.env.npm_package_version ?? "UNKNOWN-VERSION";

logger.info(`Loaded configuration from ${configPath}`);
