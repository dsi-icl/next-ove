import { mergeRouters } from "./trpc";
import { authRouter } from "./auth/router";
import { hardwareRouter } from "./hardware/router";

export const appRouter = mergeRouters(hardwareRouter, authRouter);

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
