import App from "./app/app";
import { app, BrowserWindow, screen } from "electron";
import SquirrelEvents from "./app/events/squirrel.events";
import { bootstrapElectronEvents } from "./app/events/electron.events";
import { env, fileSetup, initHardware } from "@ove/ove-bridge";

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

fileSetup();

initialize();
bootstrapApp();
bootstrapEvents();

console.log(`testing env: ${env.CORE_URL}`)

initHardware();
