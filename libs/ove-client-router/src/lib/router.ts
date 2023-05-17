import { mergeRouters } from "./trpc";
import { hardwareRouter } from "./routes/hardware";
import { authRouter } from "./routes/auth";

export const appRouter = mergeRouters(hardwareRouter, authRouter);

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
