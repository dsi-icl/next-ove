import { initTRPC, TRPCError } from "@trpc/server";
import type { Context } from "./context";
import type { OpenApiMeta } from "trpc-to-openapi";
import { ZodError } from "zod";
import { logger } from "../env";

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
});
export const adminProcedure = procedure.use(async (opts) => {
  const { ctx } = opts;
  if (ctx?.req?.role !== "admin") {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return opts.next({ ctx });
});

