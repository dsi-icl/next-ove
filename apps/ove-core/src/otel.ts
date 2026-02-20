import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { SocketIoInstrumentation } from "@opentelemetry/instrumentation-socket.io";

import { env } from "./env";

if (env.LOGGING?.OTEL?.COLLECTOR_URL !== undefined) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: env.APP_NAME,
    }),

    traceExporter: new OTLPTraceExporter({
      url: env.LOGGING.OTEL.COLLECTOR_URL,
    }),

    instrumentations: [
      getNodeAutoInstrumentations(),
      new SocketIoInstrumentation(),
    ],
  });

  sdk.start();
}
