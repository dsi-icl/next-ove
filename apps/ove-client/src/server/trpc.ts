import { ZodError } from "zod";
import { SpanKind, SpanStatusCode, trace } from "@opentelemetry/api";
import { type OpenApiMeta } from "trpc-to-openapi";
import { initTRPC, TRPCError } from "@trpc/server";

import { env, logger } from "../env";
import { type Context } from "./context";

const trpc = initTRPC.meta<OpenApiMeta>()
  .context<Context>().create({
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

const tracing = trpc.middleware(
  async ({ path, next }) =>
    tracer.startActiveSpan(
      `api.${path}`,
      {
        kind: SpanKind.SERVER,
        attributes: {
          "rpc.system": "api",
          "rpc.method": path,
        },
      },
      async (span) => {
        try {
          const result = await next();
          span.setStatus({ code: SpanStatusCode.OK });
          return result;
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
);

export const mergeRouters = trpc.mergeRouters;
export const procedure = trpc.procedure.use(async (opts) => {
  logger.trace(`Handling ${opts.path} for user ${opts.ctx?.user ?? "anonymous"}`)
  const start = Date.now();

  const result = await opts.next();

  const durationMs = Date.now() - start;
  const meta = { path: opts.path, type: opts.type, durationMs };

  result.ok
    ? logger.trace("OK request timing:", meta)
    : logger.trace("Non-OK request timing", meta);

  return result;
}).use(tracing);

const isAuthed = trpc.middleware(({ ctx: { user }, next }) => {
  if (user !== env.AUTH.STORED_CREDENTIALS) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return next({
    ctx: {
      user: user
    }
  });
});

// you can reuse this for any procedure
export const protectedProcedure = procedure.use(isAuthed);
