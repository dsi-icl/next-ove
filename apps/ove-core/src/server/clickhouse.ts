import fs from "fs";
import path from "path";
import { createClient, type ClickHouseClient } from "@clickhouse/client";

import { env } from "../env";

const loadCACertificate = (certPath: string | undefined) => {
  if (!certPath) return undefined;

  const resolvedPath = path.resolve(certPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(
      `ClickHouse CA certificate not found at: ${resolvedPath}`
    );
  }

  return fs.readFileSync(resolvedPath);
};

const createClickHouseClient = (): ClickHouseClient | undefined => {
  if(env.CLICKHOUSE === undefined) return undefined;
  const ca = loadCACertificate(env.CLICKHOUSE.CA_PATH);

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
};

export const clickhouse = createClickHouseClient();
