import App from "./app/app";
import SquirrelEvents from "./app/events/squirrel.events";
import ElectronEvents from "./app/events/electron.events";
import initUpdates from "./app/events/update.events";
import { app, BrowserWindow, desktopCapturer, screen } from "electron";
import { OutboundAPI } from "./ipc-routes";

export const start = (closeServer: () => void) => {
  App.init(app, BrowserWindow, screen, closeServer);
};

export const createWindow = (url?: string, displayId?: number): string => {
  if (!App.isInitialised()) throw new Error("Window controller is not initialised");
  if (url === undefined) {
    return App.openWindow(App.loadDisplayWindow, displayId);
  } else {
    return App.openWindow((idx: string) => {
      App.loadCustomWindow(url, idx);
    }, displayId);
  }
};

export const closeWindow = (idx: string): boolean => {
  if (!App.isInitialised()) throw new Error("Window controller is not initialised");
  App.closeWindow(idx);
  return true;
};

export const triggerIPC: OutboundAPI = Object.entries(App.triggerIPC).reduce((acc, [k, v]) => {
  acc[k] = (...args: Parameters<typeof v>) => {
    if (!App.isInitialised()) throw new Error("Window controller is not initialised");
    v(...args)
    return true;
  };
  return acc;
}, <Record<string, unknown>>{}) as OutboundAPI;

export const takeScreenshots = () =>
  desktopCapturer.getSources({ types: ["screen"] });

export const initializeElectron = () => {
  if (SquirrelEvents.handleEvents()) {
    app.quit();
  }
};

export const initializeElectronEvents = () => {
  ElectronEvents.bootstrapElectronEvents();
  initUpdates();
};
