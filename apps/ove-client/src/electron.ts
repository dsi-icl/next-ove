/* global process */

import { app, BrowserWindow, desktopCapturer, screen } from "electron";
import oveApp from "./app/app";
import SquirrelEvents from "./app/events/squirrel.events";
import ElectronEvents from "./app/events/electron.events";
import initUpdates from "./app/events/update.events";
import { environment } from "./environments/environment";
import { ID } from "@ove/ove-types";

let appController: ReturnType<typeof oveApp> | null = null;

export const start = (closeServer: () => void) => {
  appController = oveApp(app, BrowserWindow, screen, {}, closeServer);
};

export const createWindow = (url?: string, displayId?: ID) => {
  if (appController === null) throw new Error("App Controller not initialised");
  if (url === undefined) {
    return appController.openWindow(appController.loadDisplayWindow, displayId);
  } else {
    return appController.openWindow((idx: string) => {
      if (appController === null) {
        throw new Error("App Controller not initialised");
      }
      appController.loadCustomWindow(url, idx);
    }, displayId);
  }
};

export const closeWindow = (idx: string) => {
  if (appController === null) {
    throw new Error("App Controller not initialised");
  }
  appController.closeWindow(idx);
};

export const triggerIPC = (event: string, ...args: any[]) => {
  if (appController === null) {
    throw new Error("App Controller not initialised");
  }
  appController.triggerIPC(event, ...args);
};

export const takeScreenshots = async () =>
  desktopCapturer.getSources({ types: ["screen"] });

export const initializeElectron = () => {
  if (SquirrelEvents.handleEvents()) {
    app.quit();
  }
};

const isDevelopmentMode = () => {
  const isEnvironmentSet: boolean = "ELECTRON_IS_DEV" in process.env;
  const getFromEnvironment: boolean =
    parseInt(process.env.ELECTRON_IS_DEV || "1", 10) === 1;

  return isEnvironmentSet ? getFromEnvironment : !environment.production;
};

export const initializeElectronEvents = () => {
  ElectronEvents.bootstrapElectronEvents();

  if (!isDevelopmentMode()) {
    initUpdates();
  }
};
