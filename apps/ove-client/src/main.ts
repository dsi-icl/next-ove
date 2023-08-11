/* global setTimeout, console, process */

import { start as startServer } from "./server";
import {
  start as startElectron,
  initializeElectron,
  initializeElectronEvents
} from "./electron";

const serverCloseHandler = startServer();

startElectron(() => serverCloseHandler());

initializeElectron();
initializeElectronEvents();
