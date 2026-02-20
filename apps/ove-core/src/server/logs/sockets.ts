import { assert } from "@ove/ove-utils";
import { env, logger } from "../../env";
import { clickhouse } from "../clickhouse";
import { nanoid } from "nanoid";
import { io as SocketServer } from "../sockets";

export const io = SocketServer.of("/socket/logs");
const clients = new Set<string>();
let interval: NodeJS.Timeout | null = null;

const getSlowSpans = async () => {
  const res = await assert(clickhouse).query({
    query: `
      SELECT *
      FROM traces
      WHERE start_time > now() - INTERVAL {query_interval:UInt32} SECOND
        AND duration_ns > 1000000000
      LIMIT 50
    `,
    query_params: { query_interval: (env.CLICKHOUSE?.LIVE_QUERY_INTERVAL ?? 10_000) / 1000 },
    format: "JSONEachRow",
  });

  const raw = (await res.json()) as Record<string, unknown>[];
  return {
    message: "slowSpans",
    data: raw.map((l) => ({ ...l, live_id: nanoid() })),
  };
};

const getLiveSpans = async () => {
  const res = await assert(clickhouse).query({
    query: `
      SELECT *
      FROM traces
      WHERE start_time > now() - INTERVAL {query_interval:UInt32} SECOND
      ORDER BY start_time
      LIMIT 500
    `,
    query_params: { query_interval: (env.CLICKHOUSE?.LIVE_QUERY_INTERVAL ?? 10_000) / 1000 },
    format: "JSONEachRow",
  });

  const raw = (await res.json()) as Record<string, unknown>[];
  return {
    message: "liveSpans",
    data: raw.map((l) => ({ ...l, live_id: nanoid() })),
  };
};

const getLiveLogs = async () => {
  const res = await assert(clickhouse).query({
    query: `
      SELECT *
      FROM logs
      WHERE timestamp > now() - INTERVAL {query_interval:UInt32} SECOND
      ORDER BY timestamp
      LIMIT 1000
    `,
    query_params: { query_interval: (env.CLICKHOUSE?.LIVE_QUERY_INTERVAL ?? 10_000) / 1000 },
    format: "JSONEachRow",
  });

  const raw = (await res.json()) as Record<string, unknown>[];
  return { message: "liveLogs", data: raw.map((l) => ({ ...l, live_id: nanoid() })) };
};

export const startInterval = () => {
  if (env.CLICKHOUSE !== undefined && clickhouse !== undefined) {
    interval = setInterval(async () => {
      const queries: PromiseSettledResult<{ message: string; data: unknown[] }>[] =
        await Promise.allSettled([getSlowSpans(), getLiveSpans(), getLiveLogs()]);
      queries.forEach((res) => {
        if (res.status === "rejected") {
          logger.error("Error processing live ClickHouse query", res.reason);
          return;
        }
        io.emit(res.value.message, res.value.data);
      });
    }, env.CLICKHOUSE.LIVE_QUERY_INTERVAL ?? 10_000);
  }
};

export const stopInterval = () => {
  if (interval === null) return;
  clearInterval(interval);
  interval = null;
};

io.on("connection", (socket) => {
  clients.add(socket.id);
  if (clients.size === 1) startInterval();

  socket.on("disconnect", () => {
    clients.delete(socket.id);
    if (clients.size === 0) stopInterval();
  });
});


