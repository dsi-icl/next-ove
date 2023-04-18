/* global process, __dirname, console */

import { join } from "path";
import { pathToFileURL } from "url";
import { env } from "@ove/ove-bridge";
import { type BrowserWindow as BW, type App, type Screen } from "electron";
import { rendererAppName, rendererAppPort } from "./constants";

export default (() => {
  let mainWindow: BW | null = null;
  let application: App;
  let BrowserWindow: typeof BW;
  let screen: Screen;

  const isDevelopmentMode = () => {
    if (process.env.ELECTRON_IS_DEV !== undefined) {
      return parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
    }
    return env.NODE_ENV !== "production";
  };

  const onWindowAllClosed = () => {
    if (process.platform !== "darwin") {
      application.quit();
    }
  };

  const onReady = () => {
    initMainWindow();
    loadMainWindow();
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
      mainWindow
        .loadURL(`http://localhost:${rendererAppPort}`)
        .then(() => console.log("Loaded URL"));
    } else {
      mainWindow
        .loadURL(
          pathToFileURL(
            join(__dirname, "..", rendererAppName, "index.html")
          ).toString()
        )
        .then(() => console.log("Loaded URL"));
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

  return {
    isDevelopmentMode,
    init
  };
})();
