import { BrowserControl } from "../types";
import { state } from "../state";
import { createWindow } from "../../electron";
import * as path from "path";
import * as fs from "fs";
import SystemInfo from "./system-info";
import { screenshot as takeScreenshots } from "../../electron";
import { Systeminformation } from "systeminformation";
import GraphicsDisplayData = Systeminformation.GraphicsDisplayData;

export const addBrowser = (browserId: number) => {
  state.browsers[browserId] = {
    controller: new AbortController()
  };
};

export const removeBrowser = (browserId: number) => {
  state.browsers[browserId].controller.abort();
  delete state.browsers[browserId];
};

const openBrowser = (displayId?: number): number => {
  const browserId = Object.keys(state.browsers).length;
  addBrowser(browserId);
  createWindow(displayId);
  return browserId;
};

const screenshot = async (method: string, screens: number[], format?: string): Promise<(Buffer | string)[]> => {
  let displays: GraphicsDisplayData[] = (await SystemInfo().graphics()).general.displays;
  if (screens.length !== 0) {
    displays = displays.filter(({ displayId }) => screens.includes(Number(displayId)));
  }

  if (displays.length === 0) {
    throw new Error("No displays with matching names found. To view available displays please use the /info?type=graphics endpoint");
  }

  const screenshots = await takeScreenshots();
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

const closeBrowser = removeBrowser;

const getBrowserStatus = (browserId: number): { status: string } => {
  if (Object.keys(state.browsers).includes(browserId.toString())) {
    return { status: "open" };
  } else {
    return { status: "closed" };
  }
};

const getBrowsers = (): number[] => Object.keys(state.browsers).map(parseInt);
const closeBrowsers = () => Object.keys(state.browsers).forEach(key => removeBrowser(parseInt(key)));

export default (): BrowserControl => ({
  openBrowser,
  closeBrowser,
  getBrowserStatus,
  getBrowsers,
  closeBrowsers,
  screenshot
});
