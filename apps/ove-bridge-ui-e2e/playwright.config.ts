import type { PlaywrightTestConfig } from "@playwright/test";

// TODO: investigate
// eslint-disable-next-line @nx/enforce-module-boundaries
import { baseConfig } from "../../playwright.config.base";

const config: PlaywrightTestConfig = {
  ...baseConfig
};

export default config;
