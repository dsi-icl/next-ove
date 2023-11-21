/* global Buffer, __dirname */

import * as fs from "fs";
import * as path from "path";
import SystemInfo from "./system-info";
import { type DesktopCapturerSource } from "electron";
import { Systeminformation } from "systeminformation";
import GraphicsDisplayData = Systeminformation.GraphicsDisplayData;
import {
  Browser,
  type ScreenshotMethod
} from "@ove/ove-types";
import { logger } from "../../../env";

const windowController = <{
  createWindow: ((url?: string, displayId?: number) => string) | null,
  takeScreenshots: (() => Promise<DesktopCapturerSource[]>) | null,
  closeWindow: ((windowId: string) => void) | null,
}>{
  createWindow: null,
  takeScreenshots: null,
  closeWindow: null
};

const init = (
  createWindow: (url?: string, displayId?: number) => string,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>,
  closeWindow: (windowId: string) => void
) => {
  windowController.createWindow = createWindow;
  windowController.takeScreenshots = takeScreenshots;
  windowController.closeWindow = closeWindow;
};

const closeBrowser = (windowId: string) => {
  if (windowController.closeWindow === null) {
    throw new Error("Window controller not initialised");
  }
  windowController.closeWindow(windowId);
  return true;
};

const openBrowser = (url?: string, displayId?: number) => {
  if (windowController.createWindow === null) {
    throw new Error("Window controller not initialised");
  }
  return windowController.createWindow(url, displayId);
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
      .filter(({ displayId }) => screens.includes(Number(displayId)));
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

const closeBrowsers = (browsers: IterableIterator<Browser>) => {
  let status = true;
  for (const browser of browsers) {
    status = status && closeBrowser(browser.windowId);
  }
  return status;
};

const service = {
  init,
  openBrowser,
  closeBrowser,
  closeBrowsers,
  screenshot
};

export default service;
