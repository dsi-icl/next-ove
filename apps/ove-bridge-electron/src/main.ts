import App from "./app/app";
import UpdateEvents from "./app/events/update.events";
import { app, BrowserWindow, screen } from "electron";
import SquirrelEvents from "./app/events/squirrel.events";
import { bootstrapElectronEvents } from "./app/events/electron.events";
import { fileSetup, initHardware } from "@ove/ove-bridge";

const initialize = () => {
  if (SquirrelEvents.handleEvents()) {
    app.quit();
  }
};

const bootstrapApp = () => {
  App.init(app, BrowserWindow, screen);
};

const bootstrapEvents = () => {
  bootstrapElectronEvents();

  if (!App.isDevelopmentMode()) {
    UpdateEvents.initAutoUpdateService();
  }
};

fileSetup();

initialize();
bootstrapApp();
bootstrapEvents();

initHardware();
