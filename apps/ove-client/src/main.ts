import { start as startServer } from "./server";
import {
  start as startElectron,
  initializeElectron,
  initializeElectronEvents
} from "./electron";

process.on("SIGINT", () => {
  console.log("Received SIGINT");
});

const serverClose = startServer();
startElectron(() => {
  serverClose();
  console.log(`Killing process with PID: ${process.pid}`);
  setTimeout(() => {
    console.log("Exiting");
    process.exit(0);
  }, 100);
  // noinspection TypeScriptValidateJSTypes
  process.kill(process.pid, "SIGINT");
});
initializeElectron();
initializeElectronEvents();
