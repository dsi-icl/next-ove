import { env } from "../env";
import superjson from "superjson";
import { type Context } from "./context";
import { type OpenApiMeta } from "trpc-openapi";
import { initTRPC, TRPCError } from "@trpc/server";

const trpc = initTRPC.meta<OpenApiMeta>()
  .context<Context>().create({ transformer: superjson });
export const router = trpc.router;

export const mergeRouters = trpc.mergeRouters;
export const procedure = trpc.procedure;

const isAuthed = trpc.middleware(({ ctx: { user }, next }) => {
  if (user === null || !env.AUTHORISED_CREDENTIALS.includes(user)) {
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
