import { router } from "./trpc";
import { coreRouter } from "./core/router";
import { bridgeRouter } from "./bridge/router";
import { renderRouter } from "./render/router";
import { hardwareRouter } from "./hardware/router";
import { projectsRouter } from "./projects/router";

export const appRouter = router({
  hardware: hardwareRouter,
  bridge: bridgeRouter,
  core: coreRouter,
  projects: projectsRouter,
  render: renderRouter,
});

export type AppRouter = typeof appRouter;
