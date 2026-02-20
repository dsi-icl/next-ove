import { router } from "./trpc";
import { coreRouter } from "./core/router";
import { docsRouter } from "./docs/router";
import { logsRouter } from "./logs/router";
import { adminRouter } from "./admin/router";
import { bridgeRouter } from "./bridge/router";
import { hardwareRouter } from "./hardware/router";
import { projectsRouter } from "./projects/router";

export const appRouter = router({
  hardware: hardwareRouter,
  bridge: bridgeRouter,
  core: coreRouter,
  projects: projectsRouter,
  admin: adminRouter,
  docs: docsRouter,
  logs: logsRouter,
});

export type AppRouter = typeof appRouter;
