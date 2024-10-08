import { env } from "../env";
import { type Context } from "./context";
import { type OpenApiMeta } from "trpc-openapi";
import { initTRPC, TRPCError } from "@trpc/server";

const trpc = initTRPC.meta<OpenApiMeta>()
  .context<Context>().create();
export const router = trpc.router;

export const mergeRouters = trpc.mergeRouters;
export const procedure = trpc.procedure;

const isAuthed = trpc.middleware(({ ctx: { user }, next }) => {
  if (user !== env.AUTHORISED_CREDENTIALS) {
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
