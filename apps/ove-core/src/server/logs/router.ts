import { z } from "zod";

import { io } from "./sockets";
import { logger } from "../../env";
import { procedure, router } from "../trpc";
import { nanoid } from "nanoid";

logger.info("Initialised logs socket namespace:", io.name);

const LatencyOverTimeInputSchema = z.strictObject({
  start: z.string(),
  end: z.string(),
  services: z.array(z.string()).optional(),
  interval: z
    .enum(["minute", "5m", "15m", "hour"])
    .optional()
    .default("minute"),
});
const LatencyOverTimeOutputSchema = z
  .strictObject({
    t: z.string(),
    p50: z.number(),
    p95: z.number(),
    p99: z.number(),
    count: z.number(),
  })
  .array();
const ServiceHealthSchema = z
  .strictObject({
    service: z.string(),
    errors: z.number(),
    total: z.number(),
    error_rate: z.number(),
  })
  .array();
const LatencyPercentilesSchema = z
  .strictObject({
    service: z.string(),
    p50: z.number(),
    p95: z.number(),
    p99: z.number(),
  })
  .array();
const SpanSchema = z.strictObject({
  trace_id: z.string(),
  span_id: z.string(),
  parent_span_id: z.string(), // empty string if root

  service: z.string(),
  name: z.string(),
  kind: z.string(),

  start_time: z.string(),
  end_time: z.string(),

  duration_ns: z.union([
    z.number(),
    z.string().regex(/^\d+$/), // ClickHouse may return UInt64 as string
  ]),

  status_code: z.string(),
  status_message: z.string(),

  attributes: z.record(z.string(), z.string()),

  events: z.array(
    z.object({
      timestamp: z.string(),
      name: z.string(),
      attributes: z.record(z.string(), z.string()),
    }),
  ),
});
const LogSchema = z.strictObject({
  timestamp: z.string(),

  source: z.string(),
  service: z.string(),
  level: z.string(),

  trace_id: z.string(),
  span_id: z.string(),

  message: z.string(),
  host: z.string(),

  attributes: z.record(z.string(), z.string()),
});
const TracesWithLogsSchema = z.strictObject({
  spans: SpanSchema.array(),
  logs: LogSchema.array(),
});

const getBucketExpression = (interval: string) => {
  switch (interval) {
    case "5m":
      return "toStartOfInterval(start_time, INTERVAL 5 MINUTE)";
    case "15m":
      return "toStartOfInterval(start_time, INTERVAL 15 MINUTE)";
    case "hour":
      return "toStartOfHour(start_time)";
    case "minute":
    default:
      return "toStartOfMinute(start_time)";
  }
};

export const logsRouter = router({
  serviceHealth: procedure
    .meta({
      openapi: {
        path: "/logs/service-health",
        method: "GET",
        protect: true,
      },
    })
    .input(
      z.strictObject({
        start: z.string(),
        end: z.string(),
      }),
    )
    .output(ServiceHealthSchema)
    .query(async ({ input, ctx }) => {
      logger.info("Getting service health");
      if (ctx.clickhouse === undefined)
        throw new Error("Clickhouse not configured");
      const res = await ctx.clickhouse.query({
        query: `
          SELECT
            service,
            countIf(status_code = 'ERROR') AS errors,
            count() AS total,
            errors / total AS error_rate
          FROM traces
          WHERE start_time BETWEEN {start:DateTime64} AND {end:DateTime64}
          GROUP BY service
          ORDER BY error_rate DESC
        `,
        query_params: {
          start: input.start.slice(0, -1),
          end: input.end.slice(0, -1),
        },
        format: "JSONEachRow",
      });

      const raw = await res.json();
      console.log(raw);
      return ServiceHealthSchema.parse(raw);
    }),

  latencyPercentiles: procedure
    .meta({
      openapi: {
        path: "/logs/latency-percentiles" as const,
        method: "GET" as const,
        protect: true,
      },
    })
    .input(
      z.strictObject({
        start: z.string(),
        end: z.string(),
      }),
    )
    .output(LatencyPercentilesSchema)
    .query(async ({ input, ctx }) => {
      logger.info("Getting latency percentiles");
      if (ctx.clickhouse === undefined)
        throw new Error("Clickhouse not configured");
      const res = await ctx.clickhouse.query({
        query: `
          SELECT
            service,
            quantile(0.5)(duration_ns)/1e6 AS p50,
            quantile(0.95)(duration_ns)/1e6 AS p95,
            quantile(0.99)(duration_ns)/1e6 AS p99
          FROM traces
          WHERE start_time BETWEEN {start:DateTime64} AND {end:DateTime64}
          GROUP BY service
        `,
        query_params: {
          start: input.start.slice(0, -1),
          end: input.end.slice(0, -1),
        },
        format: "JSONEachRow",
      });

      const raw = await res.json();
      console.log(raw);
      return LatencyPercentilesSchema.parse(raw);
    }),

  traceWithLogs: procedure
    .meta({
      openapi: {
        path: "/logs/traces-with-logs" as const,
        method: "GET" as const,
        protect: true,
      },
    })
    .input(z.strictObject({ traceId: z.string() }))
    .output(TracesWithLogsSchema)
    .query(async ({ input, ctx }) => {
      logger.info("Getting trace with logs");
      if (ctx.clickhouse === undefined)
        throw new Error("Clickhouse not configured");
      const spansRes = await ctx.clickhouse.query({
        query: `SELECT * FROM traces WHERE trace_id = {id:String}`,
        query_params: { id: input.traceId },
        format: "JSONEachRow",
      });

      const logsRes = await ctx.clickhouse.query({
        query: `SELECT * FROM logs WHERE trace_id = {id:String}`,
        query_params: { id: input.traceId },
        format: "JSONEachRow",
      });

      const rawSpans = await spansRes.json();
      const rawLogs = await logsRes.json();
      console.log(rawSpans, rawLogs);
      return TracesWithLogsSchema.parse({ spans: rawSpans, logs: rawLogs });
    }),

  latencyOverTime: procedure
    .meta({
      openapi: {
        path: "/logs/latency-over-time" as const,
        method: "GET" as const,
        protect: true,
      },
    })
    .input(LatencyOverTimeInputSchema)
    .output(LatencyOverTimeOutputSchema)
    .query(async ({ input, ctx }) => {
      logger.info("Getting latency over time");
      if (ctx.clickhouse === undefined)
        throw new Error("Clickhouse not configured");
      const bucketExpr = getBucketExpression(input.interval);

      const serviceFilter =
        input.services && input.services.length > 0
          ? "AND service IN {services:Array(String)}"
          : "";

      const result = await ctx.clickhouse.query({
        query: `
          SELECT
            ${bucketExpr} AS t,
            quantile(0.50)(duration_ns) / 1e6 AS p50,
            quantile(0.95)(duration_ns) / 1e6 AS p95,
            quantile(0.99)(duration_ns) / 1e6 AS p99,
            count() AS count
          FROM traces
          WHERE start_time BETWEEN {start:DateTime64} 
                               AND {end:DateTime64}
            ${serviceFilter}
          GROUP BY t
          ORDER BY t ASC
        `,
        query_params: {
          start: input.start.slice(0, -1),
          end: input.end.slice(0, -1),
          services: input.services,
        },
        format: "JSONEachRow",
      });

      const raw = await result.json();
      console.log(raw);
      return LatencyOverTimeOutputSchema.parse(raw);
    }),

  getLogs: procedure
    .meta({
      openapi: {
        path: "/logs/logs" as const,
        method: "GET" as const,
        protect: true,
      },
    })
    .input(
      z.strictObject({
        start: z.string(),
        end: z.string(),
        page: z.number().min(1),
        pageSize: z.number().min(1).max(100),
      }),
    )
    .output(
      z.strictObject({
        logs: LogSchema.extend({ live_id: z.string() }).array(),
        total: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      logger.info("Getting trace with logs");
      if (ctx.clickhouse === undefined)
        throw new Error("Clickhouse not configured");
      const offset = (input.page - 1) * input.pageSize;

      const logsRes = await ctx.clickhouse.query({
        query: `SELECT * FROM logs WHERE timestamp < {end:DateTime64} AND timestamp > {start:DateTime64} ORDER BY timestamp DESC LIMIT {limit:UInt32} OFFSET {offset:UInt32}`,
        query_params: {
          start: input.start.slice(0, -1),
          end: input.end.slice(0, -1),
          limit: input.pageSize,
          offset,
        },
        format: "JSONEachRow",
      });

      const countRes = await ctx.clickhouse.query({
        query: `
          SELECT count() as total
          FROM logs
          WHERE timestamp < {end:DateTime64}
            AND timestamp > {start:DateTime64}
        `,
        query_params: {
          start: input.start.slice(0, -1),
          end: input.end.slice(0, -1),
        },
        format: "JSONEachRow",
      });

      const rawLogs = await logsRes.json();
      const countResult = await countRes.json();

      const total =
        z.strictObject({ total: z.number() }).optional().parse(countResult[0])
          ?.total ?? 0;
      return {
        logs: LogSchema.array()
          .parse(rawLogs)
          .map((log) => ({ ...log, live_id: nanoid() })),
        total,
      };
    }),

  getTraces: procedure
    .meta({
      openapi: {
        path: "/logs/traces" as const,
        method: "GET" as const,
        protect: true,
      },
    })
    .input(
      z.strictObject({
        start: z.string(),
        end: z.string(),
        page: z.number().min(1),
        pageSize: z.number().min(1).max(100),
      }),
    )
    .output(
      z.strictObject({
        traces: SpanSchema.extend({ live_id: z.string() }).array(),
        total: z.number(),
      }),
    )
    .query(async ({ input, ctx }) => {
      logger.info("Getting trace with logs");
      if (ctx.clickhouse === undefined)
        throw new Error("Clickhouse not configured");
      const offset = (input.page - 1) * input.pageSize;

      const spansRes = await ctx.clickhouse.query({
        query: `SELECT * FROM traces WHERE end_time < {end:DateTime64} AND start_time > {start:DateTime64} ORDER BY start_time DESC LIMIT {limit:UInt32} OFFSET {offset:UInt32}`,
        query_params: {
          start: input.start.slice(0, -1),
          end: input.end.slice(0, -1),
          offset,
          limit: input.pageSize,
        },
        format: "JSONEachRow",
      });

      const countRes = await ctx.clickhouse.query({
        query: `
          SELECT count() as total
          FROM traces
          WHERE timestamp < {end:DateTime64}
            AND timestamp > {start:DateTime64}
        `,
        query_params: {
          start: input.start.slice(0, -1),
          end: input.end.slice(0, -1),
        },
        format: "JSONEachRow",
      });

      const rawSpans = await spansRes.json();
      const countResult = await countRes.json();

      const total =
        z.strictObject({ total: z.number() }).optional().parse(countResult[0])
          ?.total ?? 0;
      return {
        traces: SpanSchema.array()
          .parse(rawSpans)
          .map((span) => ({ ...span, live_id: nanoid() })),
        total,
      };
    }),
});
