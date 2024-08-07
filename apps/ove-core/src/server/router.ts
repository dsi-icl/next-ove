import { authRouter } from "./auth/router";
import { coreRouter } from "./core/router";
import { mergeRouters, router } from "./trpc";
import { bridgeRouter } from "./bridge/router";
import { hardwareRouter } from "./hardware/router";
import { projectsRouter } from "./projects/router";

const baseRouter = router({
  hardware: hardwareRouter,
  bridge: bridgeRouter,
  core: coreRouter,
  projects: projectsRouter
});

export const appRouter = mergeRouters(baseRouter, authRouter);

export type AppRouter = typeof appRouter;
