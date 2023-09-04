import { mergeRouters, router } from "./trpc";
import { hardwareRouter } from "./hardware/router";
import { authRouter } from "./auth/router";
import { bridgeRouter } from "./bridge/router";

const baseRouter = router({
  hardware: hardwareRouter,
  bridge: bridgeRouter
});

// @ts-ignore
export const appRouter = mergeRouters(baseRouter, authRouter);

export type AppRouter = typeof appRouter;
