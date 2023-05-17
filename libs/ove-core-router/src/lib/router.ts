import { router } from "./trpc";
import { hardwareRouter } from "./hardware/router";

export const appRouter = router({
  hardware: hardwareRouter
});

export type AppRouter = typeof appRouter;
