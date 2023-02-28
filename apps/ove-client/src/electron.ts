import { app, BrowserWindow, desktopCapturer } from "electron";
import App from "./app/app";
import { logger } from "./utils";
import SquirrelEvents from "./app/events/squirrel.events";
import ElectronEvents from "./app/events/electron.events";
import initUpdates from "./app/events/update.events";

export const createWindow = (displayId?: number) => {
  if (!app.isReady()) return;
  logger.info("Creating Window");
  App.main(app, BrowserWindow, displayId);
};

export const takeScreenshots = async () => desktopCapturer.getSources({ types: ["screen"] });

export const initializeElectron = () => {
  if (SquirrelEvents.handleEvents()) {
    // squirrel event handled (except first run event) and app will exit in 1000ms, so don't do anything else
    app.quit();
  }
};

export const initializeElectronEvents = () => {
  ElectronEvents.bootstrapElectronEvents();

  // initialize auto updater service
  if (!App.isDevelopmentMode()) {
    initUpdates();
  }
};
