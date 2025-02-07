import * as path from "path";
import { app } from "electron";
import { initEnv } from "@ove/ove-bridge-base";

const configPath = path.join(app.getPath("userData"), "ove-bridge-config.json");

export const setupEnv = () => initEnv(configPath, app.getVersion());
