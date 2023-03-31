import * as fs from "fs";
import * as path from "path";
import SystemInfo from "./system-info";
import { DesktopCapturerSource } from "electron";
import { Systeminformation } from "systeminformation";
import { Browser, ID, Image, ScreenshotMethod } from "@ove/ove-types";
import GraphicsDisplayData = Systeminformation.GraphicsDisplayData;

const controller = <{
  createWindow: ((url?: string, displayId?: ID) => string) | null,
  takeScreenshots: (() => Promise<DesktopCapturerSource[]>) | null,
  closeWindow: ((idx: string) => void) | null,
}>{
  createWindow: null,
  takeScreenshots: null,
  closeWindow: null
};

const init = (createWindow: (url?: string, displayId?: ID) => string, takeScreenshots: () => Promise<DesktopCapturerSource[]>, closeWindow: (idx: string) => void) => {
  controller.createWindow = createWindow;
  controller.takeScreenshots = takeScreenshots;
  controller.closeWindow = closeWindow;
};

const closeBrowser = (browser: Browser) => {
  if (controller.closeWindow === null) throw new Error("Controller not initialised");
  console.log(`Browser being closed: ${JSON.stringify(browser)}`);
  controller.closeWindow(browser.idx);
};

const openBrowser = (url?: string, displayId?: ID) => {
  if (controller.createWindow === null) throw new Error("Cannot create window as missing function");
  return controller.createWindow(url, displayId);
};

const screenshot = async (method: ScreenshotMethod, screens: ID[]): Promise<Image[]> => {
  if (controller.takeScreenshots === null) throw new Error("Controller not initialised for managing browsers");
  let displays: GraphicsDisplayData[] = (await SystemInfo().graphics()).graphics.displays;
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

const closeBrowsers = (browsers: Browser[]) => browsers.forEach(browser => closeBrowser(browser));

export default () => ({
  init,
  openBrowser,
  closeBrowser,
  closeBrowsers,
  screenshot,
});
