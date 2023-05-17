import { initTRPC, TRPCError } from "@trpc/server";
import { OpenApiMeta } from "trpc-openapi";
import { Context } from "./context";
import { state } from "./state";

const trpc = initTRPC.meta<OpenApiMeta>().context<Context>().create();
export const router = trpc.router;

export const mergeRouters = trpc.mergeRouters;
export const procedure = trpc.procedure;

const isAuthed = trpc.middleware((opts) => {
  const { ctx } = opts;
  if (ctx.user !== null && state.authorisedCredentials.includes(ctx.user)) {
    return opts.next({
      ctx: {
        user: ctx.user,
      },
    });
  }

  throw new TRPCError({ code: "UNAUTHORIZED" });

});

// you can reuse this for any procedure
export const protectedProcedure = procedure.use(isAuthed);
