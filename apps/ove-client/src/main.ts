import { start } from "./server";
import { initializeElectron, initializeElectronEvents } from "./electron";

start();
initializeElectron();
initializeElectronEvents();
