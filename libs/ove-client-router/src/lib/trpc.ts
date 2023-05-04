import { initTRPC } from "@trpc/server";
import { OpenApiMeta } from "trpc-openapi";
import { Context } from "./context";

const trpc = initTRPC.meta<OpenApiMeta>().context<Context>().create();
export const router = trpc.router;

export const mergeRouters = trpc.mergeRouters;
export const procedure = trpc.procedure;
