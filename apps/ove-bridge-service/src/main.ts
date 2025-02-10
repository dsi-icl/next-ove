/* global process, __dirname */

import * as path from "node:path";
import { initHardware, initBridge, initEnv } from "@ove/ove-bridge-base";

initEnv(
  path.join(__dirname, "config", "config.json"),
  process.env.npm_package_version ?? "UNKNOWN-VERSION"
);

initHardware();
initBridge();
