/* global process, __dirname */

import { join } from "path";
import { pathToFileURL } from "url";
import { env, logger } from "../env";
import initAutoUpdate from "./events/update.events";
import { type BrowserWindow as BW, type App, type Screen, app } from "electron";
import { type OutboundAPI, outboundChannels } from "../ipc-routes";
import { assert } from "@ove/ove-utils";
import { exit } from "process";

let mainWindow: BW | null = null;
let application: App;
let BrowserWindow: typeof BW;
let screen: Screen;

const isDevelopmentMode = () => !app.isPackaged;

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

const loadErrorPage = () => {
  const formattedUrl = pathToFileURL(
    join(__dirname, "assets", "error.html")).toString();
  mainWindow!.loadURL(formattedUrl)
    .then(() => logger.info(`Loaded url: ${formattedUrl}`))
    .catch(reason => {
      logger.fatal(reason);
      app.exit(1);
      exit(1);
    });
};

const loadMainWindow = () => {
  if (mainWindow === null) throw new Error("Main window should not be null");
  if (!application.isPackaged) {
    const formattedUrl = `${assert(env.RENDER_CONFIG).PROTOCOL}://${assert(env.RENDER_CONFIG).HOSTNAME}:${assert(env.RENDER_CONFIG).PORT}`;
    mainWindow.loadURL(formattedUrl)
      .then(() => logger.info(`Loaded url: ${formattedUrl}`))
      .catch(reason => {
        logger.error(reason);
        loadErrorPage();
      });
  } else {
    const formattedUrl = pathToFileURL(
      join(__dirname, "..", env.UI_ALIAS, "index.html")).toString();
    mainWindow.loadURL(formattedUrl)
      .then(() => logger.info(`Loaded url: ${formattedUrl}`))
      .catch(reason => {
        logger.error(reason);
        loadErrorPage();
      });
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

const triggerIPC: OutboundAPI = Object.entries(outboundChannels).reduce((acc, [k, channel]) => {
  const key = k as keyof OutboundAPI;
  acc[k] = (args: Parameters<OutboundAPI[typeof key]>) => {
    if (mainWindow === null) return;
    mainWindow.webContents.send(channel, args);
  };
  return acc;
}, <Record<string, unknown>>{}) as OutboundAPI;

export default {
  isDevelopmentMode,
  init,
  triggerIPC
};
