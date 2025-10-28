/* global __dirname, setTimeout */

import { type OutboundAPI, outboundChannels } from "../ipc-routes";
import { join } from "path";
import { exit } from "process";
import { pathToFileURL } from "url";
import { env, logger } from "../env";
import { assert } from "@ove/ove-utils";
import { type App, BrowserWindow as BW, type Screen, session } from "electron";
import { state } from "../server/state";
import {
  type Display,
  getDisplay,
  getDisplayByScreenId,
  resolveDisplays
} from "../server/hardware/displays";

let application: App;
let BrowserWindow: typeof BW;
let screen: Screen;
let closeServer: () => void;
let initialised = false;

let pinIdx: number | null = null;
const windows = new Map<number, BW>();

const initBrowser = (url: string, display?: Display) => {
  let bounds;

  if (display !== undefined) {
    bounds = screen
      .getAllDisplays()
      .find((screen) => screen.id === assert(display).screenId)?.bounds ?? {
      x: 0,
      y: 0,
    };
  } else {
    const primary = screen.getPrimaryDisplay();
    bounds = primary.bounds;
    display = getDisplayByScreenId(primary.id);
  }
  const browser = new BrowserWindow({
    x: bounds.x + 50,
    y: bounds.y + 50,
    fullscreen: true,
    show: false,
    webPreferences: {
      contextIsolation: true,
      backgroundThrottling: true,
      sandbox: true,
      nodeIntegration: false,
      preload: join(__dirname, "main.preload.cjs"),
    },
  });
  state.browsers.set(browser.id, { displayId: display.id, url });
  windows.set(browser.id, browser);
  browser.setMenu(null);
  browser.center();

  browser.once("ready-to-show", () => {
    browser.show();
  });

  browser.webContents.session.setCertificateVerifyProc((req, callback) => {
    if (env.AUTH.HOSTNAME_WHITELIST?.includes(req.hostname) ?? false) {
      callback(0);
    } else {
      callback(-3);
    }
  });

  return browser.id;
};

const loadURL = (idx: number, url: string, isFatal = false) => {
  if (!windows.has(idx)) throw new Error("Missing window");
  assert(windows.get(idx))
    ?.loadURL(url)
    .then(() => logger.info(`Loaded url: ${url}`))
    .catch((reason) => {
      if (isFatal) {
        logger.fatal(reason);
        closeServer();
        application.exit(1);
        exit(1);
      } else {
        logger.error(reason);
        loadURL(
          idx,
          pathToFileURL(join(__dirname, "assets", "error.html")).toString(),
          true,
        );
      }
    });
};

const formatURL = (url?: string) => {
  url = url ?? "/auth";
  const isLocal = url.startsWith("/");
  url = isLocal && !url.endsWith(".html") ? `${url}.html` : url;
  url = isLocal ? url.substring(1) : url;
  return isLocal
    ? pathToFileURL(join(__dirname, "assets", url)).toString()
    : url;
};

const loadDefaultWindows = async () => {
  const idxs: number[] = [];
  if (env.AUTH.STORED_CREDENTIALS === undefined) {
    const idx = initBrowser("/auth");
    pinIdx = idx;
    idxs.push(idx);
    loadURL(idx, formatURL());
  } else {
    for (const [k, v] of Object.entries(env.BROWSERS.CONFIG)) {
      const browser = Array.from(state.browsers.entries()).find(
        (v_) => v_[1].displayId === parseInt(k),
      );
      const idx =
        browser === undefined
          ? initBrowser(v, getDisplay(parseInt(k)))
          : browser[0];
      await new Promise((resolve) => setTimeout(resolve, env.BROWSERS.DELAY));
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
  updatePin: (pin) => {
    if (pinIdx === null) throw new Error("Missing default ID");
    if (!windows.has(pinIdx)) throw new Error("Missing window");
    assert(windows.get(pinIdx)).webContents.send(
      outboundChannels["updatePin"],
      pin,
    );
  },
};

const init = (
  app: App,
  browserWindow: typeof BW,
  sc: Screen,
  cs: () => void,
) => {
  BrowserWindow = browserWindow;
  application = app;
  screen = sc;
  closeServer = cs;

  application.on("window-all-closed", () => {
    if (env.AUTH.STORED_CREDENTIALS !== undefined) return;
    app.quit();
    closeServer();
    exit(0);
  });
  application.on("ready", async () => {
    if (env.EXTENSIONS?.SYNC !== undefined) {
      try {
        const ext = await session.defaultSession.loadExtension(
          env.EXTENSIONS.SYNC,
          {
            allowFileAccess: true,
          },
        );
        logger.info(`Loaded extension: ${ext.name} (${ext.id})`);
      } catch (e) {
        logger.error("⚠️ failed to load extension", e);
      }
    }
    try {
      await resolveDisplays();
      logger.info("Resolved displays");
    } catch (e) {
      logger.error("Failed to resolve displays:", e);
    }
    await loadDefaultWindows();
  });
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
    return new Promise<number[]>((resolve) =>
      setTimeout(
        async () => resolve(await loadDefaultWindows()),
        env.BROWSERS.DELAY,
      ),
    );
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
  isInitialised: () => initialised,
};

export default app;
