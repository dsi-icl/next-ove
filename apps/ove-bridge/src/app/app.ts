/* global process, __dirname */

import { join } from "path";
import { pathToFileURL } from "url";
import { env, logger } from "@ove/ove-bridge-env";
import initAutoUpdate from "./events/update.events";
import { type BrowserWindow as BW, type App, type Screen } from "electron";
import { OutboundAPI, outboundChannels } from "@ove/ove-bridge-shared";
import { assert } from "@ove/ove-utils";

let mainWindow: BW | null = null;
let application: App;
let BrowserWindow: typeof BW;
let screen: Screen;

const isDevelopmentMode = () => env.RENDER_CONFIG === undefined;

const onWindowAllClosed = () => {
  if (process.platform !== "darwin") {
    application.quit();
  }
};

const onReady = () => {
  initMainWindow();
  loadMainWindow();
  const handler = initAutoUpdate();
  handler();
};

const onActivate = () => {
  if (mainWindow === null) {
    onReady();
  }
};

const initMainWindow = () => {
  const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
  const width = Math.min(1280, workAreaSize.width || 1280);
  const height = Math.min(720, workAreaSize.height || 720);

  mainWindow = new BrowserWindow({
    width: width,
    height: height,
    show: false,
    webPreferences: {
      contextIsolation: true,
      backgroundThrottling: false,
      preload: join(__dirname, "main.preload.js")
    }
  });
  mainWindow.setMenu(null);
  mainWindow.center();

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

const loadMainWindow = () => {
  if (mainWindow === null) throw new Error("Main window should not be null");
  if (!application.isPackaged) {
    const formattedUrl = `${assert(env.RENDER_CONFIG).PROTOCOL}://${assert(env.RENDER_CONFIG).HOSTNAME}:${assert(env.RENDER_CONFIG).PORT}`;
    mainWindow.loadURL(formattedUrl)
      .then(() => logger.info(`Loaded url: ${formattedUrl}`));
  } else {
    const formattedUrl = pathToFileURL(
      join(__dirname, "..", env.UI_ALIAS, "index.html")).toString();
    mainWindow.loadURL(formattedUrl)
      .then(() => logger.info(`Loaded url: ${formattedUrl}`));
  }
};

const init = (app: App, browserWindow: typeof BW, sc: Screen) => {
  BrowserWindow = browserWindow;
  application = app;
  screen = sc;

  application.on("window-all-closed", onWindowAllClosed);
  application.on("ready", onReady);
  application.on("activate", onActivate);
};

const triggerIPC: OutboundAPI =
  (Object.keys(outboundChannels) as Array<keyof OutboundAPI>)
    .reduce((acc, k) => {
      acc[k] = (...args: Parameters<OutboundAPI[typeof k]>) => {
        if (mainWindow === null) return;
        mainWindow.webContents.send(outboundChannels[k], ...args);
      };
      return acc;
    }, {} as OutboundAPI);

export default {
  isDevelopmentMode,
  init,
  triggerIPC
};
