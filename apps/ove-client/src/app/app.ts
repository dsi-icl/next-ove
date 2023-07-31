/* global __dirname, console */

import { nanoid } from "nanoid";
import { join } from "path";
import { pathToFileURL } from "url";
import {
  rendererAppName,
  rendererAppPort
} from "./constants";
import { App, BrowserWindow as BW, Screen } from "electron";
import { ID } from "@ove/ove-types";
import { logger } from "../utils";

let application: App;
let BrowserWindow: typeof BW;
let screen: Screen;
let windows: { [key: string]: BW };
let closeServer: () => void;
let initialised = false;

let defaultIdx: string | null = null;

const onWindowAllClosed = () => {
  if (defaultIdx === null) {
    defaultIdx = initWindow();
    loadMainWindow(defaultIdx);
  } else {
    application?.quit();
  }
};

const initWindow = (displayId?: number) => {
  let bounds;

  if (displayId !== undefined) {
    bounds = screen
      .getAllDisplays()
      .find(monitor =>
        monitor.id === displayId)?.bounds || { x: 0, y: 0 };
  } else {
    bounds = screen.getPrimaryDisplay().bounds;
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

const loadUIWindow = (idx: string, url?: `/${string}`) => {
  if (!application.isPackaged) {
    const formattedUrl = url === undefined ? "" : url;
    windows[idx]
      .loadURL(`http://localhost:${rendererAppPort}${formattedUrl}`)
      .then(() => console.log("Loaded URL"));
  } else {
    windows[idx]
      .loadURL(pathToFileURL(join(__dirname, "..", rendererAppName,
        `${url === undefined ? "index" : url}.html`)).toString())
      .then(() => console.log("Loaded URL"));
  }
};

const loadMainWindow = (idx: string) => {
  if (windows[idx] === null) {
    throw new Error("Main window should not be null");
  }
  loadUIWindow(idx);
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

const init = (app: App, browserWindow: typeof BW, sc: Screen, cs: () => void) => {
  BrowserWindow = browserWindow;
  application = app;
  screen = sc;
  closeServer = cs;

  application.on("window-all-closed", onWindowAllClosed);
  application.on("ready", onReady);
  application.on("activate", onActivate);
  application.on("will-quit", closeServer);

  initialised = true;
};

export default {
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
    loadUIWindow(idx);
  },
  loadCustomWindow: (url: string, idx: string) => {
    windows[idx]?.loadURL(
      url.toString()
    ).then(() => logger.info("Loaded"));
  },
  triggerIPC: (event: string, ...args: any[]) => {
    if (defaultIdx !== null) {
      windows[defaultIdx].webContents.send(event, ...args);
    }
  },
  isInitialised: () => initialised,
  init
};
