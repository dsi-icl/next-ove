// noinspection DuplicatedCode
import { nanoid } from "nanoid";
import { join } from "path";
import { pathToFileURL } from "url";
import { logger } from "../utils";
import { type BrowserWindow } from "electron";
import { ID } from "@ove/ove-types";

export default (App: Electron.App, BrowserWindow: typeof Electron.BrowserWindow, Screen: Electron.Screen, windows: { [uid: string]: BrowserWindow }, closeServer: () => void) => {
  let defaultIdx: string | null = null;

  const onWindowAllClosed = () => {
    if (defaultIdx === null) {
      defaultIdx = initWindow();
      loadMainWindow(defaultIdx);
    } else {
      App.quit();
    }
  };

  const initWindow = (displayId?: number) => {
    let bounds;

    if (displayId !== undefined) {
      bounds = Screen.getAllDisplays().find(monitor => monitor.id === displayId)?.bounds || {
        x: 0,
        y: 0
      };
    } else {
      bounds = Screen.getPrimaryDisplay().bounds;
    }

    const mw = new BrowserWindow({
      x: bounds.x + 50,
      y: bounds.y + 50,
      fullscreen: true,
      show: false,
      webPreferences: {
        contextIsolation: true,
        backgroundThrottling: false,
        preload: join(__dirname, "main.preload.js")
      }
    });
    const idx = nanoid();
    windows = { ...windows, [idx]: mw };
    windows[idx].setMenu(null);
    windows[idx].center();

    windows[idx].once("ready-to-show", () => {
      windows[idx]?.show();
    });

    windows[idx].on("closed", () => {
      delete windows[idx];
    });

    return idx;
  };

  const loadMainWindow = (idx: string) => {
    const url = pathToFileURL(join(__dirname, "assets", "about.html"));
    windows[idx]?.loadURL(
      url.toString()
    ).then(() => logger.info("Loaded"));
  };

  const onReady = () => {
    defaultIdx = initWindow();
    loadMainWindow(defaultIdx);
  };

  const onActivate = () => {
    if (Object.keys(windows).length === 0) {
      onReady();
    }
  };

  App.on("window-all-closed", onWindowAllClosed);
  App.on("ready", onReady);
  App.on("activate", onActivate);
  App.on("will-quit", closeServer);

  return {
    openWindow: (loadWindow: (idx: string) => void, displayId?: ID) => {
      if (defaultIdx !== null) {
        windows[defaultIdx].close();
        delete windows[defaultIdx];
      }
      defaultIdx = null;
      const idx = initWindow(displayId);
      loadWindow(idx);
      return idx;
    },
    closeWindow: (idx: string) => {
      windows[idx].close();
      delete windows[idx];
    },
    loadDisplayWindow: (idx: string) => {
      const url = pathToFileURL(join(__dirname, "assets", "index.html"));
      windows[idx]?.loadURL(
        url.toString()
      ).then(() => logger.info("Loaded"));
    },
    loadCustomWindow: (url: string, idx: string) => {
      windows[idx]?.loadURL(
        url.toString()
      ).then(() => logger.info("Loaded"));
    }
  };
};