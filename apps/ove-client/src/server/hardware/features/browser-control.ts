/* global Buffer, __dirname */

import * as fs from "fs";
import * as path from "path";
import { logger } from "../../../env";
import SystemInfo from "./system-info";
import { type DesktopCapturerSource } from "electron";
import { Systeminformation } from "systeminformation";
import { type ScreenshotMethod } from "@ove/ove-types";
import GraphicsDisplayData = Systeminformation.GraphicsDisplayData;

type WindowController = {
  createWindow: (() => Promise<number[]>) | null,
  takeScreenshots: (() => Promise<DesktopCapturerSource[]>) | null,
  closeWindow: ((windowId: number) => void) | null,
  reloadWindow: ((windowId: number) => void) | null,
  reloadWindows: (() => void) | null
}

const windowController: WindowController = {
  createWindow: null,
  takeScreenshots: null,
  closeWindow: null,
  reloadWindow: null,
  reloadWindows: null
};

const init = (
  createWindow: WindowController["createWindow"],
  takeScreenshots: WindowController["takeScreenshots"],
  closeWindow: WindowController["closeWindow"],
  reloadWindow: WindowController["reloadWindow"],
  reloadWindows: WindowController["reloadWindows"]
) => {
  windowController.createWindow = createWindow;
  windowController.takeScreenshots = takeScreenshots;
  windowController.closeWindow = closeWindow;
  windowController.reloadWindow = reloadWindow;
  windowController.reloadWindows = reloadWindows;
};

const openBrowser = () => {
  if (windowController.createWindow === null) {
    throw new Error("Window controller not initialised");
  }
  return windowController.createWindow();
};

const processScreenshots = (
  displays: GraphicsDisplayData[],
  screenshots: DesktopCapturerSource[],
  method: ScreenshotMethod
) => {
  return Promise.allSettled(displays.map(async ({ displayId, serial }) => {
    const image = screenshots
      // eslint-disable-next-line camelcase
      .find(({ display_id }) => display_id === displayId)
      ?.thumbnail
      .toDataURL();

    if (image === undefined) {
      throw Error(`No screen found matching displayId: ${displayId}`);
    }

    if (method === "response") {
      return image;
    } else if (method === "local") {
      const dir = path.join(__dirname, "screenshots");

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const filename = `${serial}-${new Date().toISOString()}.png`;
      fs.createWriteStream(filename).write(Buffer.from(image, "base64url"));
      return filename;
    } else {
      throw Error("Not Implemented");
    }
  }));
};

const cleanupOnError = (
  results: PromiseSettledResult<string>[],
  displays: GraphicsDisplayData[],
  method: ScreenshotMethod
) => {
  (results.filter(({ status }) => status === "fulfilled") as {
    value: string
  }[]).forEach(({ value }) => {
    if (method === "response" || method === "upload") return;
    try {
      fs.rmSync(value);
    } catch (e) {
      logger.error(`Failed to remove file: ${value}. Cause: ${e}`);
    }
  });
  return results
    .filter(({ status }) => status === "rejected")
    .map((_x, i) => displays[i].displayId)
    .join(", ");
};

const screenshot = async (
  method: ScreenshotMethod,
  screens: number[]
): Promise<string[]> => {
  if (windowController.takeScreenshots === null) {
    throw new Error("Controller not initialised for managing browsers");
  }

  let displays: GraphicsDisplayData[] = (await SystemInfo.graphics())
    .graphics.displays;

  if (screens.length !== 0) {
    displays = displays
      .filter(({ displayId }) => screens.includes(parseInt(displayId ?? "-1")));
  }

  if (displays.length === 0) {
    throw new Error("No displays with matching names found. " +
      "To view available displays please use the /info?type=graphics endpoint");
  }

  const screenshots = await windowController.takeScreenshots();
  const results = await processScreenshots(displays, screenshots, method);

  const hasErrored = results.find(x => x.status === "rejected");
  if (!hasErrored) {
    return (results as PromiseFulfilledResult<string>[])
      .map(({ value }) => value);
  }
  const errored = cleanupOnError(results, displays, method);
  throw new Error(`Failed to take screenshot on displays: ${errored}`);
};

const closeBrowsers = (browsers: IterableIterator<number>) => {
  for (const browser of browsers) {
    if (windowController.closeWindow === null) {
      throw new Error("Controller not initialised for managing browsers");
    }
    windowController.closeWindow(browser);
  }
  return true;
};

const reloadBrowser = (windowId: number) => {
  if (windowController.reloadWindow === null) {
    throw new Error("Controller not initialised for managing browsers");
  }
  windowController.reloadWindow(windowId);
  return true;
};

const reloadBrowsers = () => {
  if (windowController.reloadWindows === null) {
    throw new Error("Controller not initialised for managing browsers");
  }
  windowController.reloadWindows();
  return true;
};

const service = {
  init,
  openBrowser,
  closeBrowsers,
  screenshot,
  reloadBrowser,
  reloadBrowsers
};

export default service;
