import { env } from "../env";
import { isAuthed } from "./auth/utils";
import type { Context } from "./context";
import type { OpenApiMeta } from "trpc-openapi";
import { initTRPC, TRPCError } from "@trpc/server";

const trpc = initTRPC
  .meta<OpenApiMeta>()
  .context<Context>()
  .create();

export const router = trpc.router;
export const procedure = trpc.procedure;

export const mergeRouters = trpc.mergeRouters;

export const middleware = trpc.middleware;

const isAuthedWrapper = middleware(async opts => {
  const { ctx } = opts;
  const username = await isAuthed(ctx.prisma, ctx.user);

  switch (username) {
    case null:
    case "unauthorised":
      throw new TRPCError({ code: "UNAUTHORIZED" });
    case "disabled":
      return opts.next({
        ctx: { user: env.TEST_USER ?? "" }
      });
    default:
      return opts.next({
        ctx: { user: username }
      });
  }
});

// you can reuse this for any procedure
export const protectedProcedure = procedure.use(isAuthedWrapper);
