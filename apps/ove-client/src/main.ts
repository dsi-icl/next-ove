import { start } from "./control/control-server";
import { initializeElectron, initializeElectronEvents } from "./electron";

start();
initializeElectron();
initializeElectronEvents();
