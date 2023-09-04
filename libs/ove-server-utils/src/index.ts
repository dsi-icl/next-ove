import * as all from "@ove/ove-utils";
import {safeFetch} from "./lib/ove-fetch";
import * as fileUtils from "./lib/ove-file-utils";
import {saveConfig, updateConfig} from "./lib/ove-env-utils";

export {
  saveConfig,
  updateConfig
};

export default {
  ...all,
  ...fileUtils,
  safeFetch
};
