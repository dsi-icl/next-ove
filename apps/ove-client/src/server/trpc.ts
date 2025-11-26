import { env, logger } from "../env";
import { type Context } from "./context";
import { type OpenApiMeta } from "trpc-to-openapi";
import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

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
});

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
