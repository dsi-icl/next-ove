import { context, trace } from "@opentelemetry/api";

type LogLevel = "debug" | "trace" | "info" | "warn" | "error";

type CollectorConfig = { endpoint: string; apiKey: string };

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  trace: 3,
  debug: 4,
};

interface LogAttributes {
  [key: string]: string;
}

interface LogEntry {
  timestamp: string;
  source: string;
  service: string;
  level: LogLevel;
  trace_id: string;
  span_id: string;
  message: string;
  host: string;
  attributes: LogAttributes;
}

const isBrowser =
  typeof window !== "undefined" && typeof window.document !== "undefined";

const safeToString = (value: unknown): string => {
  if (typeof value === "string") return value;

  try {
    return JSON.stringify(value);
  } catch {
    return "[unserializable]";
  }
};

const extractFromArgs = (
  args: unknown[],
): {
  message: string;
  attributes: Record<string, string>;
} => {
  const attributes: Record<string, string> = {};
  let messageParts: string[] = [];

  args.forEach((arg, index) => {
    if (arg instanceof Error) {
      attributes[`error.name`] = arg.name;
      attributes[`error.message`] = arg.message;
      attributes[`error.stack`] = arg.stack ?? "";
      messageParts.push(arg.message);
      return;
    }

    if (typeof arg === "object" && arg !== null) {
      Object.entries(arg as Record<string, unknown>).forEach(([key, value]) => {
        attributes[key] = safeToString(value);
      });
      return;
    }

    if (typeof arg === "string") {
      messageParts.push(arg);
      return;
    }

    attributes[`arg_${index}`] = safeToString(arg);
  });

  if (messageParts.length === 0) {
    messageParts = ["(no message)"];
  }

  return {
    message: messageParts.join(" "),
    attributes,
  };
};

const getTraceContext = (): { traceId: string; spanId: string } => {
  const span = trace.getSpan(context.active());

  if (!span) {
    return { traceId: "", spanId: "" };
  }

  const spanContext = span.spanContext();

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
};

const sendToRemoteCollector = (
  entry: LogEntry,
  collector: CollectorConfig,
): void => {
  console.log("Sending to collector", isBrowser);
  if (!isBrowser) return;

  const payload = JSON.stringify({
    api_key: collector.apiKey,
    log: entry,
  });

  // Prefer sendBeacon for non-blocking logging
  if (navigator.sendBeacon) {
    const blob = new Blob([payload], {
      type: "application/json",
    });
    navigator.sendBeacon(collector.endpoint, blob);
    return;
  }

  // Fallback to fetch
  void fetch(collector.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload,
    keepalive: true,
  }).catch(() => {
    // Swallow errors — logging must never break the app
  });
};

const log = (
  currentLogLevel: LogLevel,
  level: LogLevel,
  serviceName: string,
  hostname: string,
  source: string,
  collector: CollectorConfig | undefined,
  args: unknown[],
): void => {
  if (LOG_LEVELS[level] > LOG_LEVELS[currentLogLevel]) {
    return;
  }

  const { message, attributes } = extractFromArgs(args);
  const { traceId, spanId } = getTraceContext();
  const entry: LogEntry = {
    timestamp: new Date().toISOString(), // RFC3339, Fluent Bit compatible
    source: source,
    service: serviceName,
    level,
    trace_id: traceId,
    span_id: spanId,
    message,
    host: hostname,
    attributes,
  };

  if (isBrowser && collector !== undefined) {
    sendToRemoteCollector(entry, collector);
    return;
  }

  console.log(`${JSON.stringify(entry)}\n`);
};

export const Logger = (
  serviceName: string,
  hostname: string,
  source: string, // allows for Docker/Python/NodeJS/Browser etc
  logLevel: LogLevel,
  collector?: { endpoint: string; apiKey: string },
) => ({
  debug: (...args: unknown[]) =>
    log(logLevel, "debug", serviceName, hostname, source, collector, args),
  trace: (...args: unknown[]) =>
    log(logLevel, "trace", serviceName, hostname, source, collector, args),
  info: (...args: unknown[]) =>
    log(logLevel, "info", serviceName, hostname, source, collector, args),
  warn: (...args: unknown[]) =>
    log(logLevel, "warn", serviceName, hostname, source, collector, args),
  error: (...args: unknown[]) =>
    log(logLevel, "error", serviceName, hostname, source, collector, args),
});

export type TLogger = ReturnType<typeof Logger>;
