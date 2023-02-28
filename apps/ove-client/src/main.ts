import { start } from "./app/control/control-server";
import { initializeElectron, initializeElectronEvents } from "./electron";

start();
initializeElectron();
initializeElectronEvents();
