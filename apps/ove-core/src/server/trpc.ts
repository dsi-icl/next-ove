import { initTRPC } from "@trpc/server";
import type { Context } from "./context";
import type { OpenApiMeta } from "trpc-to-openapi";

const trpc = initTRPC.meta<OpenApiMeta>().context<Context>().create();

export const router = trpc.router;
export const procedure = trpc.procedure;
