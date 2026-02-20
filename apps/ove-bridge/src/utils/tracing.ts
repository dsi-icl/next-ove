import {
  context,
  propagation,
  SpanKind,
  SpanStatusCode,
  trace,
} from "@opentelemetry/api";
import { env } from "../env";

const tracer = trace.getTracer(env.APP_NAME);

export const extractTrace = (carrier?: Record<string, string>) =>
  propagation.extract(context.active(), carrier ?? {});

export const injectTrace = (): Record<string, string> => {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  return carrier;
};

export const traceSocketListener = <K extends string>(
  k: K,
  otel: Record<string, string> | undefined,
  callback: () => Promise<void>,
) => {
  const parentCtx = extractTrace(otel);

  tracer.startActiveSpan(
    `socket.on.${k}`,
    {
      kind: SpanKind.CONSUMER,
      attributes: {
        "messaging.system": "websocket",
        "messaging.operation": "receive",
        "messaging.destination":
          env.LOGGING?.OTEL?.SOCKET_MESSAGING_DESTINATION ?? "ove-core",
        "messaging.event": k,
      },
    },
    parentCtx,
    async (span) => {
      try {
        await callback();

        span.setStatus({ code: SpanStatusCode.OK });
      } catch (err) {
        span.recordException(err as Error);
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: (err as Error).message,
        });
        throw err;
      } finally {
        span.end();
      }
    },
  );
};
