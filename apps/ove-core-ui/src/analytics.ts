import { env } from "./env";
import { Analytics } from "@ove/ove-analytics";

export let analytics: Analytics | null = null;

if (env.COLLECTORS?.ANALYTICS !== undefined) {
  analytics = new Analytics(
    env.COLLECTORS.ANALYTICS.ENDPOINT,
    env.COLLECTORS.ANALYTICS.API_KEY,
    {
      flushIntervalMs: 2000,
      maxBatchSize: 20,
    },
  );
}
