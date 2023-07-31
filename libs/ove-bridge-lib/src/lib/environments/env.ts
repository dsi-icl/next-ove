/* global Proxy, process, console */

/* eslint-disable @typescript-eslint/ban-ts-comment */
import { z } from "zod";
import * as dotenv from "dotenv";
import { PowerModeSchema } from "@ove/ove-types";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const server = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  CORE_URL: z.string(),
  BRIDGE_NAME: z.string(),
  POWER_MODE: PowerModeSchema,
  ELECTRON_IS_DEV: z.string().optional(),
  CALENDAR_URL: z.string().optional()
});

// Don't touch the part below
// --------------------------

/** @type z.infer<server>
 *  @ts-ignore - can't type this properly in jsdoc */
let env: z.infer<typeof server> = process.env;

const initEnv = (path: string) => {
  dotenv.config({ path });
  if (process.env.SKIP_ENV_VALIDATION) return;
  const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    CORE_URL: process.env.CORE_URL,
    BRIDGE_NAME: process.env.BRIDGE_NAME,
    POWER_MODE: process.env.POWER_MODE ?? "manual",
    CALENDAR_URL: process.env.CALENDAR_URL ? process.env.CALENDAR_URL : undefined
  };
  const parsed = server.safeParse(processEnv);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed["error"].flatten().fieldErrors
    );
    throw new Error("Invalid environment variables");
  }

  /** @type z.infer<server>
   *  @ts-ignore - can't type this properly in jsdoc */
  env = new Proxy(parsed.data, {
    get(target, prop) {
      if (typeof prop !== "string") return undefined;
      /*  @ts-ignore - can't type this properly in jsdoc */
      return target[prop];
    }
  });
};

export { env, initEnv };
