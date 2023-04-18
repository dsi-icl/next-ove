/* global process, __dirname */

import { initEnv } from "./env";
import { envPath, toAsset, writeEnv, safeFileDelete } from "../utils/utils";

export default () => {
  if (process.env.NODE_ENV !== "production") {
    [
      `${__dirname}/.env`,
      `${__dirname}/assets/hardware.json`,
      `${__dirname}/assets/spaces.json`
    ].forEach(safeFileDelete);
  }

  const initialEnv = {
    CORE_URL: "localhost:3333",
    BRIDGE_NAME: "main"
  };

  writeEnv(initialEnv, false);
  initEnv(envPath);

  toAsset("hardware.json", [], false);
  toAsset("spaces.json", {}, false);
};