/* eslint-disable @typescript-eslint/ban-ts-comment */
import { z } from "zod";
import * as dotenv from "dotenv";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
const server = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  CORE_URL: z.string(),
  BRIDGE_NAME: z.string()
});

// Don't touch the part below
// --------------------------

/** @type z.infer<server>
 *  @ts-ignore - can't type this properly in jsdoc */
let env: z.infer<typeof server> = process.env;

export const initEnv = (path: string) => {
  dotenv.config({ path });
  console.log(process.env.CORE_URL);
  if (process.env.SKIP_ENV_VALIDATION) return;
  const processEnv = {
    NODE_ENV: process.env.NODE_ENV,
    CORE_URL: process.env.CORE_URL,
    BRIDGE_NAME: process.env.BRIDGE_NAME
  };
  const parsed = server.safeParse(processEnv);

  if (!parsed.success) {
    console.error(
      "❌ Invalid environment variables:",
      parsed.error.flatten().fieldErrors
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

export { env };
