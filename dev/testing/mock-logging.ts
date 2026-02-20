import { type ClickHouseClient, createClient } from "@clickhouse/client";
import path from "path";
import fs from "fs";
import { nanoid as uuid } from "nanoid";
import dotenv from "dotenv";

dotenv.config({ path: path.join(import.meta.dirname, ".env") });

const loadCACertificate = (certPath: string | undefined) => {
  if (!certPath) return undefined;

  const resolvedPath = path.resolve(certPath);

  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`ClickHouse CA certificate not found at: ${resolvedPath}`);
  }

  return fs.readFileSync(resolvedPath);
};

const createClickHouseClient = (): ClickHouseClient => {
  const ca = loadCACertificate(process.env.CLICKHOUSE_CA_PATH);

  return createClient({
    url: process.env.CLICKHOUSE_URL,
    username: process.env.CLICKHOUSE_USER,
    password: process.env.CLICKHOUSE_PASSWORD,
    database: process.env.CLICKHOUSE_DATABASE ?? "default",
    request_timeout: parseInt(process.env.CLICKHOUSE_TIMEOUT ?? "30_000"),
    tls: ca
      ? {
          ca_cert: ca,
        }
      : undefined,
  });
};

const clickhouse = createClickHouseClient();

const SERVICES = ["api", "auth", "billing", "worker"];
const LOG_LEVELS = ["INFO", "WARN", "ERROR"];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChoice<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function now() {
  return new Date().toISOString().slice(0, -1);
}

function ns(ms: number) {
  return ms * 1_000_000;
}

async function insertTrace() {
  const traceId = uuid().replace(/-/g, "");
  const rootSpanId = uuid().slice(0, 16);

  const service = randomChoice(SERVICES);
  const start = new Date();

  const durationMs = randomInt(20, 500);
  const isError = Math.random() < 0.1;
  const isSlow = Math.random() < 0.1;

  const rootDuration = isSlow
    ? randomInt(800, 2000)
    : durationMs;

  const spans = [];

  // Root span
  spans.push({
    trace_id: traceId,
    span_id: rootSpanId,
    parent_span_id: "",
    service,
    name: "HTTP GET /endpoint",
    kind: "SERVER",
    start_time: start.toISOString().slice(0, -1),
    end_time: new Date(
      start.getTime() + rootDuration
    ).toISOString().slice(0, -1),
    duration_ns: ns(rootDuration),
    status_code: isError ? "ERROR" : "OK",
    status_message: isError
      ? "Something failed"
      : "",
    attributes: {
      http_method: "GET",
      http_status: isError ? "500" : "200",
    },
    events: [],
  });

  // Child spans
  const childCount = randomInt(1, 3);

  for (let i = 0; i < childCount; i++) {
    const childStart = new Date(
      start.getTime() + randomInt(5, 50)
    );
    const childDuration = randomInt(10, 200);

    spans.push({
      trace_id: traceId,
      span_id: uuid().slice(0, 16),
      parent_span_id: rootSpanId,
      service: randomChoice(SERVICES),
      name: "DB query",
      kind: "CLIENT",
      start_time: childStart.toISOString().slice(0, -1),
      end_time: new Date(
        childStart.getTime() + childDuration
      ).toISOString().slice(0, -1),
      duration_ns: ns(childDuration),
      status_code: "OK",
      status_message: "",
      attributes: {
        db_system: "postgres",
      },
      events: [],
    });
  }

  await clickhouse.insert({
    table: "traces",
    values: spans,
    format: "JSONEachRow",
  });

  return traceId;
}

async function insertLogs(traceId: string) {
  const count = randomInt(1, 4);

  const logs = Array.from({ length: count }).map(
    () => {
      const level = randomChoice(LOG_LEVELS);

      return {
        timestamp: now(),
        source: "app",
        service: randomChoice(SERVICES),
        level,
        trace_id: traceId,
        span_id: "",
        message:
          level === "ERROR"
            ? "Unhandled exception occurred"
            : "Processing request",
        host: "localhost",
        attributes: {},
      };
    }
  );

  await clickhouse.insert({
    table: "logs",
    values: logs,
    format: "JSONEachRow",
  });
}

async function generateLoop() {
  console.log("Starting test data generator...");

  setInterval(async () => {
    try {
      const traceId = await insertTrace();
      await insertLogs(traceId);

      console.log("Inserted trace:", traceId);
    } catch (err) {
      console.error("Insert error:", err);
    }
  }, parseInt(process.env.CLICKHOUSE_LOOP_INTERVAL ?? "10_000"));
}

export async function nuke() {
  console.log("⚠️ Nuking all data...");

  await clickhouse.command({
    query: "TRUNCATE TABLE otel_traces",
  });

  await clickhouse.command({
    query: "TRUNCATE TABLE logs",
  });

  console.log("✅ All records deleted.");
}

const arg = process.argv[2];

if (arg === "nuke") {
  nuke().then(() => process.exit());
} else {
  generateLoop().catch(console.error);
}