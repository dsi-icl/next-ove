/* global process, __dirname */

import { initEnv } from "./env";
import { envPath, toAsset, writeEnv } from "@ove/file-utils";

export default () => {
  const initialEnv = {
    CORE_URL: "",
    BRIDGE_NAME: "",
    POWER_MODE: "manual"
  };

  writeEnv(initialEnv, false);
  initEnv(envPath);

  toAsset("hardware.json", [], false);
  toAsset("spaces.json", {}, false);
  toAsset("calendar.json", {lastUpdated: null, value: []}, false);
  toAsset("auto-schedule.json", {wake: null, sleep: null, schedule: [false, false, false, false, false, false, false]}, false);
};
