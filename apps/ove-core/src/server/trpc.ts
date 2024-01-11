import { env } from "../env";
import superjson from "superjson";
import * as jwt from "jsonwebtoken";
import { type Context } from "./context";
import { type OpenApiMeta } from "trpc-openapi";
import { initTRPC, TRPCError } from "@trpc/server";

const trpc = initTRPC
  .meta<OpenApiMeta>()
  .context<Context>()
  .create({ transformer: superjson });

export const router = trpc.router;
export const procedure = trpc.procedure;

export const mergeRouters = trpc.mergeRouters;

export const middleware = trpc.middleware;

const isAuthed = middleware(opts => {
  const { ctx } = opts;

  if (env.DISABLE_AUTH) {
    return opts.next({
      ctx: { user: env.TEST_USER ?? "" }
    });
  }

  if (ctx.user === null || env.ACCESS_TOKEN_SECRET === undefined) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  let user: { username: string };

  try {
    user = (jwt.verify(ctx.user, env.ACCESS_TOKEN_SECRET) as
      unknown as { username: string });
  } catch (e) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  return opts.next({
    ctx: { user: user.username }
  });
});

// you can reuse this for any procedure
export const protectedProcedure = procedure.use(isAuthed);
