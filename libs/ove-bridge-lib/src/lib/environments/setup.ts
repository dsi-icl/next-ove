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
};
