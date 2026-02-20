import * as React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Separator,
} from "@ove/ui-base-components";
import { Copy } from "lucide-react";
import { context, trace } from "@opentelemetry/api";
import type { FallbackProps } from "react-error-boundary";

type ErrorPageProps = FallbackProps & {
  title?: string;
  description?: string;
};

const getTelemetryContext = () => {
  const span = trace.getSpan(context.active());

  if (!span) {
    return null;
  }

  const spanContext = span.spanContext();

  return {
    traceId: spanContext.traceId,
    spanId: spanContext.spanId,
  };
};

const formatError = (error: unknown): string => {
  if (!error) return "No error information available.";

  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n\n${error.stack ?? ""}`;
  }

  try {
    return JSON.stringify(error, null, 2);
  } catch {
    return String(error);
  }
};

const ErrorPage = ({
  error,
  title = "Something went wrong",
  description = "An unexpected error occurred.",
}: ErrorPageProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const telemetry = getTelemetryContext();
  const formattedError = formatError(error);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(formattedError);
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-muted/40">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">
            {title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <p className="text-muted-foreground">{description}</p>

          <Separator />

          <div>
            <p className="text-sm font-medium">Route</p>
            <p className="text-sm text-muted-foreground">
              {location.pathname}
            </p>
          </div>

          {telemetry && (
            <>
              <Separator />
              <div className="space-y-2">
                <p className="text-sm font-medium">Trace Information</p>
                <div className="text-xs font-mono bg-muted p-3 rounded-md space-y-1">
                  <div>
                    <strong>Trace ID:</strong> {telemetry.traceId}
                  </div>
                  <div>
                    <strong>Span ID:</strong> {telemetry.spanId}
                  </div>
                </div>
              </div>
            </>
          )}

          {error !== undefined && error !== null ? (
            <>
              <Separator />

              <Collapsible>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Show technical details
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="mt-4 relative">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2"
                      onClick={handleCopy}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>

                    <pre className="overflow-auto rounded-md bg-black text-white p-4 text-xs">
                      <code>{formattedError}</code>
                    </pre>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </>
          ) : null}

          <Separator />

          <div className="flex gap-4">
            <Button onClick={() => navigate("/")}>
              Go Home
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ErrorPage;
