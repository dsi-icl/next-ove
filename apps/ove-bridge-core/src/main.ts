import initAutoUpdate from "./auto-update";
import { fileSetup, initHardware } from "@ove/ove-bridge";

fileSetup();
initHardware();
initAutoUpdate();
