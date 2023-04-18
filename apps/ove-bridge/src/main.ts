/* global __dirname, NodeJS */

import App from "./app/app";
import fileSetup from "./environments/setup";
import UpdateEvents from "./app/events/update.events";
import { app, BrowserWindow, screen } from "electron";
import SquirrelEvents from "./app/events/squirrel.events";
import initHardware from "./app/hardware/hardware-controller";
import { bootstrapElectronEvents } from "./app/events/electron.events";

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
