// src/socketEmit.ts
import { trace, SpanKind, SpanStatusCode, propagation, context } from "@opentelemetry/api";
import { env } from "../env";
import { q } from "shadcn/dist/index-006650f3";

export const extractTrace = (carrier?: Record<string, string>) =>
  propagation.extract(context.active(), carrier ?? {});

export const injectTrace = (): Record<string, string> => {
  const carrier: Record<string, string> = {};
  propagation.inject(context.active(), carrier);
  return carrier;
};

const tracer = trace.getTracer(`${env.APP_NAME}.websocket`);

export const wrapSocketCall = async <K extends string, T>(k: K, fn: () => Promise<T>) => {
  return tracer.startActiveSpan(
    `websocket.emit.${k}`,
    { kind: SpanKind.PRODUCER },
    async (span) => {
      try {
        span.setAttribute("messaging.system", "socket.io");
        span.setAttribute("messaging.destination", k);

        return await fn();
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
    }
  )
}
