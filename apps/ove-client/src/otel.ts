import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

// Cannot use  parsed env variable, as Otel must run before Electron is loaded
// and env relies on Electron for loading from the userData directory.
if (process.env.OTEL_COLLECTOR_URL !== undefined) {
  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: process.env.APP_NAME ?? "ove-client",
      [ATTR_SERVICE_VERSION]: process.env.npm_package_version ?? "0.0.0",
      ["deployment.environment"]: process.env.NODE_ENV ?? "development",
    }),
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_COLLECTOR_URL,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
  });

  sdk.start();
}
