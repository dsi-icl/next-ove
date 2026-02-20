import "./otel";

import { start as startServer } from "./server";
import {
  initializeElectron,
  initializeElectronEvents,
  start as startElectron,
} from "./electron";

const serverCloseHandler = startServer();

startElectron(() => serverCloseHandler());

initializeElectron();
initializeElectronEvents();
