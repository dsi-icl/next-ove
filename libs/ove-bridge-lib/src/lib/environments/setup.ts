/* global process, __dirname */

import { initEnv } from "./env";
import { envPath, safeFileDelete, toAsset, writeEnv } from "@ove/file-utils";

export default () => {
  // if (process.env.NODE_ENV !== "production") {
  //   [
  //     `${__dirname}/.env`,
  //     `${__dirname}/assets/hardware.json`,
  //     `${__dirname}/assets/spaces.json`
  //   ].forEach(safeFileDelete);
  // }

  const initialEnv = {
    CORE_URL: "localhost:3333",
    BRIDGE_NAME: "dev"
  };

  writeEnv(initialEnv, false);
  initEnv(envPath);

  toAsset("hardware.json", [], false);
  toAsset("spaces.json", {}, false);
};
