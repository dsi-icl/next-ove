/* global process */

import App from "./app/app";
import { ID } from "@ove/ove-types";
import SquirrelEvents from "./app/events/squirrel.events";
import ElectronEvents from "./app/events/electron.events";
import initUpdates from "./app/events/update.events";
import { app, BrowserWindow, desktopCapturer, screen } from "electron";
import { env } from "@ove/ove-client-env";

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

export const triggerIPC = (event: string, ...args: any[]) => {
  if (!App.isInitialised()) {
    throw new Error("App Controller not initialised");
  }
  App.triggerIPC(event, ...args);
};

export const takeScreenshots = async () =>
  desktopCapturer.getSources({ types: ["screen"] });

export const initializeElectron = () => {
  if (SquirrelEvents.handleEvents()) {
    app.quit();
  }
};

export const initializeElectronEvents = () => {
  const isDevelopment = env.RENDER_CONFIG === undefined;
  ElectronEvents.bootstrapElectronEvents();

  if (isDevelopment) {
    initUpdates();
  }
};