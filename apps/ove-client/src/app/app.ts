/* global __dirname, setTimeout */

import {
  type OutboundAPI,
  outboundChannels
} from "../ipc-routes";
import { join } from "path";
import { exit } from "process";
import { pathToFileURL } from "url";
import { env, logger } from "../env";
import { assert } from "@ove/ove-utils";
import { type App, BrowserWindow as BW, type Screen } from "electron";
import { state } from "../server/state";

let application: App;
let BrowserWindow: typeof BW;
let screen: Screen;
let closeServer: () => void;
let initialised = false;

let pinIdx: number | null = null;
const windows = new Map<number, BW>();

const initWindow = (url: string, displayId?: number) => {
  let bounds;

  if (displayId !== undefined) {
    bounds = screen.getAllDisplays()[displayId - 1]?.bounds ?? { x: 0, y: 0 };
  } else {
    const primary = screen.getPrimaryDisplay();
    bounds = primary.bounds;
    displayId = primary.id;
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
  const idx = generateNewBrowserId();
  windows.set(idx, mw);
  state.browsers.set(idx, { displayId, url });
  mw.setMenu(null);
  mw.center();

  mw.once("ready-to-show", () => {
    mw.show();
  });

  return idx;
};

const loadURL = (idx: number, url: string, isFatal = false) => {
  if (!windows.has(idx)) throw new Error("Missing window");
  assert(windows.get(idx))?.loadURL(url)
    .then(() => logger.info(`Loaded url: ${url}`))
    .catch(reason => {
      if (isFatal) {
        logger.fatal(reason);
        closeServer();
        application.exit(1);
        exit(1);
      } else {
        logger.error(reason);
        loadURL(idx, pathToFileURL(join(__dirname, "assets", "error.html"))
          .toString(), true);
      }
    });
};

const formatURL = (url?: string) => {
  if (!application.isPackaged) {
    url = url ?? "/";
    return url.startsWith("/") ?
      `${assert(env.RENDER_CONFIG).PROTOCOL}://${assert(env.RENDER_CONFIG).HOSTNAME}:${assert(env.RENDER_CONFIG).PORT}${url}` :
      url;
  } else {
    url = url ?? "/index.html";
    const isLocal = url.startsWith("/");
    url = isLocal && !url.endsWith(".html") ?
      `${url}.html` : url;
    url = isLocal ? url.substring(1) : url;
    return isLocal ?
      pathToFileURL(join(__dirname, "..", env.UI_ALIAS, url)).toString() : url;
  }
};

const generateNewBrowserId = () => Array.from(state.browsers.keys())
  .reduce((acc, x) => x > acc ? x : acc, -1) + 1;

const loadDefaultWindows = async () => {
  const idxs: number[] = [];
  if (env.AUTHORISED_CREDENTIALS === undefined) {
    const idx = initWindow("/");
    pinIdx = idx;
    idxs.push(idx);
    loadURL(idx, formatURL());
  } else {
    for (const [k, v] of Object.entries(env.WINDOW_CONFIG)) {
      const browser =
        Array.from(state.browsers.entries()).find(v_ =>
          v_[1].displayId === parseInt(k));
      const idx = browser === undefined ?
        initWindow(v, parseInt(k)) : browser[0];
      await new Promise(resolve => setTimeout(resolve, env.BROWSER_DELAY));
      idxs.push(idx);
      loadURL(idx, v);
    }
  }

  return idxs;
};

const onActivate = () => {
  if (windows.size !== 0) return;
  loadDefaultWindows().catch(logger.error);
};

const triggerIPC: OutboundAPI = {
  updatePin: pin => {
    if (pinIdx === null) throw new Error("Missing default ID");
    if (!windows.has(pinIdx)) throw new Error("Missing window");
    assert(windows.get(pinIdx)).webContents
      .send(outboundChannels["updatePin"], pin);
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

  application.on("window-all-closed", () => {
    if (env.AUTHORISED_CREDENTIALS !== undefined) return;
    app.quit();
    closeServer();
    exit(0);
  });
  application.on("ready", loadDefaultWindows);
  application.on("activate", onActivate);
  application.on("will-quit", closeServer);

  initialised = true;
};

const closeAll = () => {
  for (const [idx, window] of windows.entries()) {
    window.close();
    if (idx === pinIdx) {
      pinIdx = null;
    }
  }
  windows.clear();
  state.browsers.clear();
};

const app = {
  initialise: init,
  open: async () => {
    closeAll();
    return new Promise<number[]>(resolve =>
      setTimeout(async () =>
        resolve(await loadDefaultWindows()), env.BROWSER_DELAY));
  },
  close: (idx: number) => {
    if (!windows.has(idx)) throw new Error("Missing window");
    assert(windows.get(idx)).close();
    windows.delete(idx);
    state.browsers.delete(idx);
    if (idx === pinIdx) {
      pinIdx = null;
    }
  },
  reload: (idx: number) => {
    if (!windows.has(idx)) throw new Error("Missing window");
    windows.get(idx)?.webContents.reloadIgnoringCache();
  },
  reloadAll: () => {
    for (const window of windows.values()) {
      window.webContents.reloadIgnoringCache();
    }
  },
  triggerIPC,
  isInitialised: () => initialised
};

export default app;
