/* global Buffer, __dirname */

import * as fs from "fs";
import * as path from "path";
import SystemInfo from "./system-info";
import { type DesktopCapturerSource } from "electron";
import { Systeminformation } from "systeminformation";
import GraphicsDisplayData = Systeminformation.GraphicsDisplayData;
import {
  type Browser,
  type ID,
  type Image,
  type ScreenshotMethod
} from "@ove/ove-types";

const windowController = <{
  createWindow: ((url?: string, displayId?: ID) => string) | null,
  takeScreenshots: (() => Promise<DesktopCapturerSource[]>) | null,
  closeWindow: ((idx: string) => void) | null,
}>{
  createWindow: null,
  takeScreenshots: null,
  closeWindow: null
};

const init = (
  createWindow: (
    url?: string,
    displayId?: ID
  ) => string,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>,
  closeWindow: (idx: string) => void
) => {
  windowController.createWindow = createWindow;
  windowController.takeScreenshots = takeScreenshots;
  windowController.closeWindow = closeWindow;
};

const closeBrowser = (browser: Browser) => {
  if (windowController.closeWindow === null) throw new Error("Window controller not initialised");
  windowController.closeWindow(browser.idx);
};

const openBrowser = (url?: string, displayId?: ID) => {
  if (windowController.createWindow === null) throw new Error("Window controller not initialised");
  return windowController.createWindow(url, displayId);
};

const screenshot = async (
  method: ScreenshotMethod,
  screens: ID[]
): Promise<Image[]> => {
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
  const results = await Promise.allSettled(displays.map(async ({ displayId, serial }) => {
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

  const errored = results.find(x => x.status === "rejected");
  if (!errored) return results as unknown as string[];
  const erroredDisplays = results
    .filter(({ status }) => status === "rejected")
    .map((_x, i) => displays[i].displayId)
    .join(", ");
  throw new Error(`Failed to take screenshot on displays: ${erroredDisplays}`);
};

const closeBrowsers = (browsers: IterableIterator<Browser>) => {
  let status = true;
  for (let browser of browsers) {
    closeBrowser(browser);
  }
  return status;
};

export default {
  init,
  openBrowser,
  closeBrowser,
  closeBrowsers,
  screenshot
};
