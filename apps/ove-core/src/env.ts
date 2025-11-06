/* global process, __dirname */

import { z } from "zod";
import dotenv from "dotenv";
import * as path from "path";
import { nanoid } from "nanoid";
import { Logger } from "@ove/ove-logging";
import { generateKeyPairSync } from "crypto";
import type { Algorithm } from "jsonwebtoken";
import { setupConfig } from "@ove/ove-server-utils";

dotenv.config();

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the server isn't built with invalid env vars.
 */
const schema = z.strictObject({
  ENVIRONMENT: z.union([
    z.literal("production"),
    z.literal("development"),
    z.literal("testing"),
    z.literal("api"),
  ]),
  TESTING: z.strictObject({
    USERNAME: z.string(),
    ROLE: z.string(),
  }).optional(),
  SOCKETS: z.strictObject({
    PATH: z.string().optional(),
    ADMIN: z
      .strictObject({
        USERNAME: z.string(),
        PASSWORD: z.string(),
      })
      .optional(),
    MAX_HTTP_BUFFER_SIZE: z.number(),
    DIST_DIR: z.string(),
    PING_TIMEOUT: z.number(),
  }),
  LOGGING: z
    .strictObject({
      LEVEL: z.number().optional(),
      SERVER: z
        .strictObject({
          INGESTION: z.string(),
          AUTH: z.string(),
          API_KEY: z.string(),
        })
        .optional(),
    })
    .optional(),
  SERVER: z.strictObject({
    PORT: z.number(),
    HOSTNAME: z.string(),
    PROTOCOL: z.discriminatedUnion("TYPE", [
      z.strictObject({ TYPE: z.literal("http") }),
      z.strictObject({
        TYPE: z.literal("https"),
        KEY: z.string(),
        CERTIFICATE: z.string(),
        CA: z.string(),
      }),
    ]),
  }),
  SERVICES: z.strictObject({
    UI: z.string(),
    ASSET_STORE: z
      .strictObject({
        CA_FILE: z.string().optional(),
        ACCESS_KEY: z.string(),
        SECRET_KEY: z.string(),
        END_POINT: z.string(),
        PORT: z.number(),
        USE_SSL: z.boolean(),
        GLOBAL_BUCKETS: z.string().array(),
      })
      .optional(),
    THUMBNAIL_GENERATOR: z.string().optional(),
    DATA_FORMATTER: z.string().optional(),
  }),
  TOKENS: z.strictObject({
    SIGNING_KEYS: z.strictObject({
      PUBLIC: z.string(),
      PRIVATE: z.string(),
      PASSPHRASE: z.string(),
    }),
    ACCESS: z.strictObject({
      EXPIRY: z.string(),
      ISSUER: z.string(),
      AUDIENCE: z.string().array(),
      COOKIE: z.strictObject({
        ID: z.string(),
        DOMAIN: z.string(),
      }),
      ALGORITHM: z.custom<Algorithm>(z.string().parse),
    }),
    REFRESH: z.strictObject({
      ISSUER: z.string(),
      COOKIE: z.strictObject({
        ID: z.string(),
        DOMAIN: z.string(),
      }),
      ALGORITHM: z.custom<Algorithm>(z.string().parse),
    }),
    OTP: z.strictObject({
      ISSUER: z.string(),
      EXPIRY: z.string(),
      AUDIENCE: z.string().array(),
      ALGORITHM: z.custom<Algorithm>(z.string().parse),
    }),
  }),
  TEMPLATES: z
    .strictObject({
      CONTROLLER: z.strictObject({
        SERVER: z.string(),
        RENDERER: z.string(),
        RENDERERS: z.record(z.string(), z.string()),
      }),
    })
    .optional(),
});

const staticConfig = {
  APP_NAME: "ove-core",
  API_VERSION: 2,
  TITLE: "next-ove core",
  DESCRIPTION: "The heart of next-ove.",
} as const;

const passPhrase = nanoid(16);
const { publicKey, privateKey } = generateKeyPairSync("rsa", {
  modulusLength: 4096,
  publicKeyEncoding: {
    type: "spki",
    format: "pem",
  },
  privateKeyEncoding: {
    type: "pkcs8",
    format: "pem",
    cipher: "aes-256-cbc",
    passphrase: passPhrase,
  },
});

const defaultConfig: z.infer<typeof schema> = {
  ENVIRONMENT: process.env.NODE_ENV as
    | "production"
    | "development"
    | "testing"
    | "api",
  SERVER: {
    PORT: 3333,
    HOSTNAME: "127.0.0.1",
    PROTOCOL: { TYPE: "http" },
  },
  SOCKETS: {
    MAX_HTTP_BUFFER_SIZE: 1e8,
    DIST_DIR: path.join(
      __dirname,
      "..",
      "..",
      "..",
      "node_modules",
      "@socket.io",
      "admin-ui",
      "ui",
      "dist",
    ),
    PING_TIMEOUT: 60_000,
  },
  TOKENS: {
    SIGNING_KEYS: {
      PUBLIC: publicKey,
      PRIVATE: privateKey,
      PASSPHRASE: passPhrase,
    },
    ACCESS: {
      ISSUER: staticConfig.APP_NAME,
      EXPIRY: "24h",
      AUDIENCE: [staticConfig.APP_NAME],
      COOKIE: {
        ID: "ove-access",
        DOMAIN: "localhost",
      },
      ALGORITHM: "RS256",
    },
    REFRESH: {
      ISSUER: staticConfig.APP_NAME,
      COOKIE: {
        ID: "ove-refresh",
        DOMAIN: "localhost",
      },
      ALGORITHM: "RS256",
    },
    OTP: {
      ISSUER: staticConfig.APP_NAME,
      EXPIRY: "5s",
      AUDIENCE: [staticConfig.APP_NAME],
      ALGORITHM: "RS256",
    },
  },
  SERVICES: { UI: path.join(__dirname, "ui") },
};

const configFile = process.argv
  .slice(2)
  .find((arg) => arg.startsWith("--configFile="))
  ?.split("=")
  ?.at(-1);

const configDir =
  process.env.NODE_ENV === "development"
    ? path.join(__dirname, "..", "..", "..", "apps", "ove-core", "config")
    : path.join(__dirname, "config");
const configPath = path.join(configDir, configFile ?? "config.json");

export const env = setupConfig(configPath, defaultConfig, schema, staticConfig);

export const logger = Logger(
  env.APP_NAME,
  env.LOGGING?.LEVEL,
  env.LOGGING?.SERVER?.INGESTION,
);
logger.info(`Loaded configuration from ${configPath}`);
