import { mergeRouters, router } from "./trpc";
import { hardwareRouter } from "./hardware/router";
import { authRouter } from "./auth/router";
import { bridgeRouter } from "./bridge/router";
import { coreRouter } from "./core/router";

const baseRouter = router({
  hardware: hardwareRouter,
  bridge: bridgeRouter,
  core: coreRouter
});

// @ts-ignore
export const appRouter = mergeRouters(baseRouter, authRouter);

export type AppRouter = typeof appRouter;
