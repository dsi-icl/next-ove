import { Context } from "./context";
import { env } from "@ove/ove-client-env";
import { OpenApiMeta } from "trpc-openapi";
import { initTRPC, TRPCError } from "@trpc/server";

const trpc = initTRPC.meta<OpenApiMeta>().context<Context>().create();
export const router = trpc.router;

export const mergeRouters = trpc.mergeRouters;
export const procedure = trpc.procedure;

const isAuthed = trpc.middleware((opts) => {
  const { ctx } = opts;

  if (ctx.user === null || !env.AUTHORISED_CREDENTIALS.includes(ctx.user)) throw new TRPCError({ code: "UNAUTHORIZED" });

  return opts.next({
    ctx: {
      user: ctx.user
    }
  });
});

// you can reuse this for any procedure
export const protectedProcedure = procedure.use(isAuthed);
