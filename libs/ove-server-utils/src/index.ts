// eslint-disable-next-line @nx/enforce-module-boundaries
import * as all from "@ove/ove-utils";
import { safeFetch } from "./lib/ove-fetch";
import * as fileUtils from "./lib/ove-file-utils";
import { setupConfig, setupConfigWithRefinement } from "./lib/ove-env-utils";

export { setupConfig, setupConfigWithRefinement };

export default {
  ...all,
  ...fileUtils,
  safeFetch
};
