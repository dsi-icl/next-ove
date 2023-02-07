import { router } from "../trpc";
import { hardwareRouter } from "./hardware";

export const appRouter = router({
  hardware: hardwareRouter
});

export type AppRouter = typeof appRouter;
