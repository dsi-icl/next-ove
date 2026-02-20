import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { ZoneContextManager } from "@opentelemetry/context-zone";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";

import { env } from "./env";

if (env.COLLECTORS?.OTEL !== undefined) {
  const provider = new WebTracerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: env.APP_NAME,
    }),
    spanProcessors: [
      new BatchSpanProcessor(
        new OTLPTraceExporter({
          // Publicly reachable collector endpoint
          url: env.COLLECTORS.OTEL,
        }),
      ),
    ]
  });

  provider.register({
    contextManager: new ZoneContextManager(),
  });

  /**
   * Instrument fetch → react‑query → tRPC
   */
  registerInstrumentations({
    instrumentations: [
      new FetchInstrumentation({
        /**
         * VERY IMPORTANT:
         * Allows traceparent to be sent to Backend A
         */
        propagateTraceHeaderCorsUrls: [/\/trpc/],
        clearTimingResources: true,
      }),
    ],
  });
}
