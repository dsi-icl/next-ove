import App from "./app/app";
import { ID } from "@ove/ove-types";
import SquirrelEvents from "./app/events/squirrel.events";
import ElectronEvents from "./app/events/electron.events";
import initUpdates from "./app/events/update.events";
import { app, BrowserWindow, desktopCapturer, screen } from "electron";
import { OutboundAPI } from "@ove/ove-client-shared";

export const start = (closeServer: () => void) => {
  App.init(app, BrowserWindow, screen, closeServer);
};

export const createWindow = (url?: string, displayId?: ID) => {
  if (!App.isInitialised()) throw new Error("App Controller not initialised");
  if (url === undefined) {
    return App.openWindow(App.loadDisplayWindow, displayId);
  } else {
    return App.openWindow((idx: string) => {
      if (!App.isInitialised()) {
        throw new Error("App Controller not initialised");
      }
      App.loadCustomWindow(url, idx);
    }, displayId);
  }
};

export const closeWindow = (idx: string) => {
  if (!App.isInitialised()) {
    throw new Error("App Controller not initialised");
  }
  App.closeWindow(idx);
};

export const triggerIPC: OutboundAPI =
  (Object.keys(App.triggerIPC) as Array<keyof OutboundAPI>)
    .reduce((acc, x) => {
      acc[x] = (...args: Parameters<OutboundAPI[typeof x]>) => {
        if (!App.isInitialised()) {
          throw new Error("App Controller not initialised");
        }
        App.triggerIPC[x](...args);
      };
      return acc;
    }, {} as OutboundAPI);

export const takeScreenshots = async () =>
  desktopCapturer.getSources({ types: ["screen"] });

export const initializeElectron = () => {
  if (SquirrelEvents.handleEvents()) {
    app.quit();
  }
};

export const initializeElectronEvents = () => {
  ElectronEvents.bootstrapElectronEvents();

  if (!app.isPackaged) {
    initUpdates();
  }
};
