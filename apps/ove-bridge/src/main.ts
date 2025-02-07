import App from "./app/app";
import { setupEnv } from "./env";
import { app, BrowserWindow, screen } from "electron";
import SquirrelEvents from "./app/events/squirrel.events";
import { bootstrapElectronEvents } from "./app/events/electron.events";
import { initHardware, initBridge } from "@ove/ove-bridge-base";

setupEnv();

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
