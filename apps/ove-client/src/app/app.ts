/* global __dirname, setTimeout */

import { type OutboundAPI, outboundChannels } from "../ipc-routes";
import { join } from "path";
import { exit } from "process";
import { pathToFileURL } from "url";
import { env, logger } from "../env";
import { assert, fixedEncodeURI } from "@ove/ove-utils";
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
      backgroundThrottling: true,
      sandbox: true,
      nodeIntegration: false,
      preload: join(__dirname, "main.preload.cjs"),
    },
  });
  const idx = generateNewBrowserId();
  windows.set(idx, mw);
  state.browsers.set(idx, { displayId, url });
  mw.setMenu(null);
  mw.center();

  mw.once("ready-to-show", () => {
    mw.show();
  });

  mw.webContents.session.setCertificateVerifyProc((req, callback) => {
    if (env.AUTH.HOSTNAME_WHITELIST?.includes(req.hostname) ?? false) {
      callback(0);
    } else {
      callback(3);
    }
  });

  return idx;
};

const loadURL = (idx: number, url: string, isFatal = false) => {
  console.log("url:", url);
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

const generateNewBrowserId = () =>
  Array.from(state.browsers.keys()).reduce(
    (acc, x) => (x > acc ? x : acc),
    -1,
  ) + 1;

const loadDefaultWindows = async () => {
  const idxs: number[] = [];
  if (env.AUTH.STORED_CREDENTIALS === undefined) {
    const idx = initWindow("/auth");
    pinIdx = idx;
    idxs.push(idx);
    loadURL(idx, formatURL());
  } else {
    if (env.RENDERER.MODE === "legacy") {
      for (const [k, v] of Object.entries(env.RENDERER.WINDOW_CONFIG)) {
        const browser = Array.from(state.browsers.entries()).find(
          (v_) => v_[1].displayId === parseInt(k),
        );
        const idx =
          browser === undefined ? initWindow(v, parseInt(k)) : browser[0];
        await new Promise((resolve) => setTimeout(resolve, env.RENDERER.BROWSER_DELAY));
        idxs.push(idx);
        loadURL(idx, v);
      }
    } else {
      for (const idx of state.browsers.keys()) {
        await new Promise((resolve) => setTimeout(resolve, env.RENDERER.BROWSER_DELAY));
        idxs.push(idx);
        const otp = (await (await fetch(`${env.AUTH.SERVER_URL}/otp`, {
          headers: {
            Authorization: `Bearer ${env.AUTH.API_KEY}`
          }
        })).text());
        loadURL(idx, `${env.AUTH.SERVER_URL}/redirect?otp=${otp}&to=${fixedEncodeURI(env.RENDERER.ENDPOINT)}`)
      }
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
    return new Promise<number[]>((resolve) =>
      setTimeout(
        async () => resolve(await loadDefaultWindows()),
        env.RENDERER.BROWSER_DELAY,
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
