import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-openapi";
import { Context } from "./context";
import * as jwt from "jsonwebtoken";

const trpc = initTRPC.meta<OpenApiMeta>().context<Context>().create();

export const router = trpc.router;
export const procedure = trpc.procedure;

export const mergeRouters = trpc.mergeRouters;

export const middleware = trpc.middleware;

const isAuthed = middleware((opts) => {
  const { ctx } = opts;

  if (ctx.user !== null) {
    let user: string;

    try {
      user = jwt.verify(ctx.user, process.env.ACCESS_TOKEN_SECRET);
    } catch (e) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return opts.next({
      ctx: { user }
    });
  }

  throw new TRPCError({ code: "UNAUTHORIZED" });
});

// you can reuse this for any procedure
export const protectedProcedure = procedure.use(isAuthed);
