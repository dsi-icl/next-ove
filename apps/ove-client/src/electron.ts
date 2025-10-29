import App from "./app/app";
import SquirrelEvents from "./app/events/squirrel.events";
import ElectronEvents from "./app/events/electron.events";
import initUpdates from "./app/events/update.events";
import {
  app,
  BrowserWindow,
  desktopCapturer,
  screen,
  systemPreferences,
} from "electron";
import { type OutboundAPI } from "./ipc-routes";

export const start = (closeServer: () => void) => {
  App.initialise(app, BrowserWindow, screen, closeServer);
};

export const createBrowser = async (): Promise<number[]> => {
  if (!App.isInitialised()) {
    throw new Error("App is not initialised");
  }
  return App.open();
};

export const closeBrowser = (browserId: number): boolean => {
  if (!App.isInitialised()) {
    throw new Error("App is not initialised");
  }
  App.close(browserId);
  return true;
};

export const reloadBrowser = (browserId: number) => {
  if (!App.isInitialised()) {
    throw new Error("App is not initialised");
  }

  App.reload(browserId);
  return true;
};

export const reloadBrowsers = () => {
  if (!App.isInitialised()) {
    throw new Error("App is not initialised");
  }

  App.reloadAll();
  return true;
};

export const triggerIPC: OutboundAPI = Object.entries(App.triggerIPC).reduce(
  (acc, [k, v]) => {
    acc[k] = (...args: Parameters<typeof v>) => {
      if (!App.isInitialised()) {
        throw new Error("App is not initialised");
      }
      v(...args);
      return true;
    };
    return acc;
  },
  <Record<string, unknown>>{},
) as OutboundAPI;

export const takeScreenshots = async () => {
  if (systemPreferences.getMediaAccessStatus("screen") === "denied") {
    throw new Error("Screen capture access denied");
  }
  return desktopCapturer.getSources({ types: ["screen"] });
};

export const initializeElectron = () => {
  if (SquirrelEvents.handleEvents()) {
    app.quit();
  }
};

export const initializeElectronEvents = () => {
  ElectronEvents.bootstrapElectronEvents();
  initUpdates();
};
