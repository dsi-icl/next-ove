import { createClient, ClickHouseClient } from "@clickhouse/client";
import fs from "fs";
import path from "path";
import { env } from "./env";

function loadCACertificate() {
  const certPath = env.CLICKHOUSE.CA_PATH;

  if (!certPath) return undefined;

  const resolvedPath = path.resolve(certPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `ClickHouse CA certificate not found at: ${resolvedPath}`
    );
  }

  return fs.readFileSync(resolvedPath);
}

function createClickHouseClient(): ClickHouseClient {
  const ca = loadCACertificate();

  return createClient({
    url: env.CLICKHOUSE.URL,
    username: env.CLICKHOUSE.USER,
    password: env.CLICKHOUSE.PASSWORD,
    database: env.CLICKHOUSE.DATABASE ?? "default",
    request_timeout: env.CLICKHOUSE.TIMEOUT ?? 30_000,
    tls: ca
      ? {
        ca_cert: ca,
      }
      : undefined,
  });
}

export const clickhouse = createClickHouseClient();
