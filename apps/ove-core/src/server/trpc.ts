import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import type { OpenApiMeta } from "trpc-to-openapi";
import { ZodError } from "zod";
import { env, logger } from "../env";
import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";

const trpc = initTRPC.meta<OpenApiMeta>().context<Context>().create({
  errorFormatter(opts) {
    const { shape, error } = opts;
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

export const router = trpc.router;
const tracer = trace.getTracer(`${env.APP_NAME}.api`);

const tracingMiddleware = trpc.middleware(async ({ path, next }) =>
  tracer.startActiveSpan(
    `trpc.${path}`,
    { kind: SpanKind.INTERNAL },
    async (span) => {
      try {
        span.setAttribute("rpc.system", "trpc");
        span.setAttribute("rpc.method", path);

        return await next();
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
  ),
);
export const procedure = trpc.procedure.use(async (opts) => {
  logger.trace(`Handling ${opts.path} for user ${opts.ctx?.req?.username ?? "anonymous"}`)
  const start = Date.now();

  const result = await opts.next();

  const durationMs = Date.now() - start;
  const meta = { path: opts.path, type: opts.type, durationMs };

  result.ok
    ? logger.trace("OK request timing:", meta)
    : logger.trace("Non-OK request timing", meta);

  return result;
}).use(tracingMiddleware);
export const adminProcedure = procedure.use(async (opts) => {
  const { ctx } = opts;
  if (ctx?.req?.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({ ctx });
});

