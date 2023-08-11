import { mergeRouters } from "./trpc";
import { authRouter } from "./routes/auth";
import { hardwareRouter } from "./routes/hardware";

export const appRouter = mergeRouters(hardwareRouter, authRouter);

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
