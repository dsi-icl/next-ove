import App from "./app/app";
import { app, BrowserWindow, screen } from "electron";
import SquirrelEvents from "./app/events/squirrel.events";
import { initBridge } from "./app/api/features/bridge/routes";
import { bootstrapElectronEvents } from "./app/events/electron.events";
import { initHardware } from "./app/api/features/hardware/hardware-controller";

const initialize = () => {
  if (!SquirrelEvents.handleEvents()) return;
  app.quit();
};

const bootstrapApp = () => {
  App.init(app, BrowserWindow, screen);
};

const bootstrapEvents = () => {
  bootstrapElectronEvents();
};

initialize();
bootstrapApp();
bootstrapEvents();

initHardware();
initBridge();
