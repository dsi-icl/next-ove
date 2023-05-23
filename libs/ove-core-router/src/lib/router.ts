import { mergeRouters, router } from "./trpc";
import { hardwareRouter } from "./hardware/router";
import { authRouter } from "./auth/router";

const baseRouter = router({
  hardware: hardwareRouter
});

export const appRouter = mergeRouters(baseRouter, authRouter);

export type AppRouter = typeof appRouter;
