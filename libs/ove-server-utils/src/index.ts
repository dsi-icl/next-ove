import * as all from "@ove/ove-utils";
import {safeFetch} from "./lib/ove-fetch";
import * as fileUtils from "./lib/ove-file-utils";
import {setupConfig} from "./lib/ove-env-utils";

export {
  setupConfig
};

export default {
  ...all,
  ...fileUtils,
  safeFetch
};
