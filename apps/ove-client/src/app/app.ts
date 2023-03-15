import { BrowserWindow, screen } from "electron";
import { environment } from "../environments/environment";
import { join } from "path";
import { pathToFileURL } from "url";
import { logger } from "../utils";

export default class App {
  // Keep a global reference of the window object, if you don't, the window will
  // be closed automatically when the JavaScript object is garbage collected.
  static mainWindow: Electron.BrowserWindow | null;
  static application: Electron.App;
  static BrowserWindow: typeof Electron.BrowserWindow;
  static displayId?: number;

  public static isDevelopmentMode() {
    const isEnvironmentSet: boolean = "ELECTRON_IS_DEV" in process.env;
    const getFromEnvironment: boolean =
      parseInt(process.env.ELECTRON_IS_DEV || "1", 10) === 1;

    return isEnvironmentSet ? getFromEnvironment : !environment.production;
  }

  private static onWindowAllClosed() {
    if (process.platform !== "darwin") {
      App.application.quit();
    }
  }

  private static onReady() {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    App.initMainWindow();
    App.loadMainWindow();
  }

  private static onActivate() {
    // On macOS, it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (App.mainWindow === null) {
      App.onReady();
    }
  }

  private static initMainWindow() {
    // const workAreaSize = screen.getPrimaryDisplay().workAreaSize;
    // const width = Math.min(1280, workAreaSize.width || 1280);
    // const height = Math.min(720, workAreaSize.height || 720);
    // const {x, y, width, height} = screen.getAllDisplays().find(monitor => monitor.id === 2).bounds

    let bounds;

    logger.debug(`Display ID: ${this.displayId}`);

    if (this.displayId !== undefined) {
      bounds = screen.getAllDisplays().find(monitor => monitor.id === this.displayId)?.bounds || {x: 0, y: 0};
    } else {
      bounds = screen.getPrimaryDisplay().bounds;
    }

    logger.debug(`Bounds: ${JSON.stringify(bounds)}`);

    // Create the browser window.
    App.mainWindow = new BrowserWindow({
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
    App.mainWindow.setMenu(null);
    App.mainWindow.center();

    // if main window is ready to show, close the splash window and show the main window
    App.mainWindow.once("ready-to-show", () => {
      App.mainWindow?.show();
    });

    // handle all external redirects in a new browser window
    // App.mainWindow.webContents.on('will-navigate', App.onRedirect);
    // App.mainWindow.webContents.on('new-window', (event, url, frameName, disposition, options) => {
    //     App.onRedirect(event, url);
    // });

    // Emitted when the window is closed.
    App.mainWindow.on("closed", () => {
      // Dereference the window object, usually you would store windows
      // in an array if your app supports multi windows, this is the time
      // when you should delete the corresponding element.
      App.mainWindow = null;
    });
  }

  private static loadMainWindow() {
    // load the index.html of the app.
    // const test = new URL(join(__dirname, "assets", "index.html"))
    // console.log(test)
    // const url = format({
    //   pathname: join(__dirname, "assets", "index.html"),
    //   protocol: "file:",
    //   slashes: true
    // })
    const url = pathToFileURL(join(__dirname, "assets", "index.html"))
    App.mainWindow?.loadURL(
      url.toString()
    ).then(() => logger.info("Loaded"));
  }

  static main(app: Electron.App, browserWindow: typeof BrowserWindow, displayId?: number) {
    // we pass the Electron.App object and the
    // Electron.BrowserWindow into this function
    // so this class has no dependencies. This
    // makes the code easier to write tests for

    App.BrowserWindow = browserWindow;
    App.application = app;
    App.displayId = displayId;

    App.application.on("window-all-closed", App.onWindowAllClosed); // Quit when all windows are closed.
    App.application.on("ready", App.onReady); // App is ready to load data
    App.application.on("activate", App.onActivate); // App is activated

    App.onReady();
  }
}
