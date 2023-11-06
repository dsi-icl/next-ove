/* global __dirname */

import {
  type OutboundAPI,
  outboundChannels
} from "../ipc-routes";
import { join } from "path";
import { exit } from "process";
import { nanoid } from "nanoid";
import { pathToFileURL } from "url";
import { env, logger } from "../env";
import { assert } from "@ove/ove-utils";
import { type App, BrowserWindow as BW, type Screen } from "electron";
import { state } from "../server/state";

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
    const browserId = Array.from(state.browsers.keys()).reduce((acc, x) => x > acc ? x : acc, 0);
    state.browsers.set(browserId, { displayId: -1, url: "", windowId: defaultIdx });
  } else {
    state.browsers.clear();
    application?.quit();
  }
};

const initWindow = (displayId?: number) => {
  let bounds;

  if (displayId !== undefined) {
    bounds = screen
      .getAllDisplays()
      .find(monitor =>
        monitor.id === displayId)?.bounds ?? { x: 0, y: 0 };
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

const loadErrorPage = (idx: string) => {
  const formattedUrl = pathToFileURL(join(__dirname, "assets",
    "error.html")).toString();
  windows[idx].loadURL(formattedUrl)
    .then(() => logger.info(`Loaded url: ${formattedUrl}`))
    .catch(reason => {
      logger.fatal(reason);
      closeServer();
      application.exit(0);
      exit(1);
    });
};

const loadUIWindow = (idx: string, url?: `/${string}`) => {
  if (!application.isPackaged) {
    const formattedUrl = `${assert(env.RENDER_CONFIG).PROTOCOL}://${assert(env.RENDER_CONFIG).HOSTNAME}:${assert(env.RENDER_CONFIG).PORT}${url ?? ""}`;
    windows[idx].loadURL(formattedUrl)
      .then(() => logger.info(`Loaded url: ${formattedUrl}`))
      .catch(reason => {
        logger.error(reason);
        loadErrorPage(idx);
      });
  } else {
    const formattedUrl = pathToFileURL(join(__dirname, "..", env.UI_ALIAS,
      `${url ?? "index"}.html`)).toString();
    windows[idx].loadURL(formattedUrl)
      .then(() => logger.info(`Loaded url: ${formattedUrl}`))
      .catch(reason => {
        logger.error(reason);
        loadErrorPage(idx);
      });
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
  const browserId = Array.from(state.browsers.keys()).reduce((acc, x) => x > acc ? x : acc, 0);
  state.browsers.set(browserId, { displayId: -1, url: "", windowId: defaultIdx });
};

const onActivate = () => {
  if (Object.keys(windows).length === 0) {
    onReady();
  }
};

const triggerIPC: OutboundAPI = {
  updatePin: pin => {
    if (defaultIdx === null) throw new Error("Missing default ID");
    windows[defaultIdx].webContents.send(outboundChannels["updatePin"], pin);
  }
};

const init = (
  app: App,
  browserWindow: typeof BW,
  sc: Screen,
  cs: () => void
) => {
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
  openWindow: (loadWindow: (idx: string) => void, displayId?: number) => {
    if (defaultIdx !== null) {
      windows[defaultIdx].close();
      state.browsers.clear();
      delete windows[defaultIdx];
    }
    defaultIdx = null;
    const idx = initWindow(displayId);
    loadWindow(idx);
    return idx;
  },
  closeWindow: (idx: string) => {
    if (idx === defaultIdx) {
      defaultIdx = null;
    }
    windows[idx].close();
    delete windows[idx];
  },
  loadDisplayWindow: (idx: string) => {
    loadUIWindow(idx);
  },
  loadCustomWindow: (url: string, idx: string) => {
    windows[idx]?.loadURL(url.toString())
      .then(() => logger.info(`Loaded custom window with url: ${url}`))
      .catch(reason => {
        logger.error(reason);
        loadErrorPage(idx);
      });
  },
  triggerIPC,
  isInitialised: () => initialised,
  init
};
