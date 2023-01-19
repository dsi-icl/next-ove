import { inferAsyncReturnType } from "@trpc/server";
import * as trpcExpress from "@trpc/server/dist/adapters/express";

export const createContext = async ({}: trpcExpress.CreateExpressContextOptions) => ({});
export type Context = inferAsyncReturnType<typeof createContext>;
