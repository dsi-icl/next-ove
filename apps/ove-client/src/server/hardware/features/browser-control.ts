/* global Buffer, __dirname */

import * as fs from "fs";
import * as path from "path";
import { logger } from "../../../env";
import { type DesktopCapturerSource } from "electron";
import { type ScreenshotMethod } from "@ove/ove-types";
import { Display, displays, getDisplay } from "../displays";

type WindowController = {
  createWindow: (() => Promise<number[]>) | null;
  takeScreenshots: (() => Promise<DesktopCapturerSource[]>) | null;
  closeWindow: ((windowId: number) => void) | null;
  reloadWindow: ((windowId: number) => void) | null;
  reloadWindows: (() => void) | null;
};

const windowController: WindowController = {
  createWindow: null,
  takeScreenshots: null,
  closeWindow: null,
  reloadWindow: null,
  reloadWindows: null,
};

const init = (
  createWindow: WindowController["createWindow"],
  takeScreenshots: WindowController["takeScreenshots"],
  closeWindow: WindowController["closeWindow"],
  reloadWindow: WindowController["reloadWindow"],
  reloadWindows: WindowController["reloadWindows"],
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
  displays: Display[],
  screenshots: DesktopCapturerSource[],
  method: ScreenshotMethod,
) => {
  return Promise.allSettled(
    displays.map(async ({ id, screenId, serial }) => {
      const image = screenshots
        // eslint-disable-next-line camelcase
        .find(({ display_id }) => display_id === screenId.toString())
        ?.thumbnail.toDataURL();

      if (image === undefined) {
        throw Error(`No screen found matching displayId: ${id}`);
      }

      if (method === "response") {
        return image;
      } else if (method === "local") {
        const dir = path.join(__dirname, "screenshots");

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }

        const filename = `${serial ?? id}-${new Date().toISOString()}.png`;
        fs.createWriteStream(filename).write(Buffer.from(image, "base64url"));
        return filename;
      } else {
        throw Error("Not Implemented");
      }
    }),
  );
};

const cleanupOnError = (
  results: PromiseSettledResult<string>[],
  displays: Display[],
  method: ScreenshotMethod,
) => {
  (
    results.filter(({ status }) => status === "fulfilled") as {
      value: string;
    }[]
  ).forEach(({ value }) => {
    if (method === "response" || method === "upload") return;
    try {
      fs.rmSync(value);
    } catch (e) {
      logger.error(`Failed to remove file: ${value}. Cause: ${e}`);
    }
  });
  return results
    .map((x, i) =>
      x.status === "rejected" ? `${displays[i].id}: ${x.reason}` : null,
    )
    .filter(Boolean)
    .join(", ");
};

const screenshot = async (
  method: ScreenshotMethod,
  screens: number[],
): Promise<string[]> => {
  if (windowController.takeScreenshots === null) {
    throw new Error("Controller not initialised for managing browsers");
  }

  if (screens.filter((x) => x > displays.length - 1).length > 0) {
    throw new Error("Invalid screen ID: " + screens.join(","));
  }

  const selectedDisplays = screens.map(getDisplay);
  const screenshots = await windowController.takeScreenshots();
  const results = await processScreenshots(selectedDisplays, screenshots, method);

  const hasErrored = results.find((x) => x.status === "rejected");
  if (!hasErrored) {
    return (results as PromiseFulfilledResult<string>[]).map(
      ({ value }) => value,
    );
  }
  const errored = cleanupOnError(results, selectedDisplays, method);
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
  reloadBrowsers,
};

export default service;
