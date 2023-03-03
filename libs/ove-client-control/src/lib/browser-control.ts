import { BrowserControl, Browser } from "./types";
import { DesktopCapturerSource } from "electron";
import * as path from "path";
import * as fs from "fs";
import SystemInfo from "./system-info";
import { Systeminformation } from "systeminformation";
import GraphicsDisplayData = Systeminformation.GraphicsDisplayData;

const controller = <{ createWindow: ((displayId?: number) => void) | null, takeScreenshots: (() => Promise<DesktopCapturerSource[]>) | null }>{
  createWindow: null,
  takeScreenshots: null
};

const init = (createWindow: (displayId?: number) => void, takeScreenshots: () => Promise<DesktopCapturerSource[]>) => {
  controller.createWindow = createWindow;
  controller.takeScreenshots = takeScreenshots;
};

export const closeBrowser = (browser: Browser) => {
  browser.controller.abort();
};

const openBrowser = (displayId?: number): void => {
  if (controller.createWindow === null) return;
  controller.createWindow(displayId);
};

const screenshot = async (method: string, screens: number[], format?: string): Promise<string[]> => {
  if (controller.takeScreenshots === null) throw new Error("Controller not initialised for managing browsers");
  let displays: GraphicsDisplayData[] = (await SystemInfo().graphics()).general.displays;
  if (screens.length !== 0) {
    displays = displays.filter(({ displayId }) => screens.includes(Number(displayId)));
  }

  if (displays.length === 0) {
    throw new Error("No displays with matching names found. To view available displays please use the /info?type=graphics endpoint");
  }

  const screenshots = await controller.takeScreenshots();
  return await Promise.all(displays.map(async ({ displayId, serial }) => {
    const image = screenshots.find(({ display_id }) => display_id === displayId)?.thumbnail.toDataURL();

    if (image === undefined) {
      throw Error(`No screen found matching displayId: ${displayId}`);
    }

    if (method === "return") {
      return image;
    } else if (method === "local") {
      const dir = path.join(__dirname, "screenshots");

      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }

      const filename = `${serial}-${new Date().toISOString()}.${format || "jpg"}`;
      fs.createWriteStream(filename).write(Buffer.from(image, "base64url"));
      return filename;
    } else {
      throw Error("Not Implemented");
    }
  }));
};


const closeBrowsers = (browsers: Browser[]) => browsers.forEach(browser => closeBrowser(browser));

export default (): BrowserControl => ({
  init,
  openBrowser,
  closeBrowser,
  closeBrowsers,
  screenshot
});
