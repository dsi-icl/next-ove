import { type ID, type Status, type TClientService } from "@ove/ove-types";
import { env, logger } from "../../env";
import { state, updatePin } from "../state";
import service from "./service";
import { type DesktopCapturerSource } from "electron";
import { type OutboundAPI } from "../../ipc-routes";

export const init = (
  createWindow: (url?: string, displayId?: ID) => string,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>,
  closeWindow: (idx: string) => Status | null,
  triggerIPC: OutboundAPI
) => {
  service.init(createWindow, takeScreenshots, closeWindow);
  state.pinUpdateCallback = triggerIPC["updatePin"];
  setInterval(updatePin, env.PIN_UPDATE_DELAY);
};

const controller: TClientService = {
  getStatus: async () => {
    logger.info("GET /status - getting service's status");
    return true;
  },
  getInfo: async ({ type }) => {
    logger.info("GET /info - getting device information");
    return service.getInfo(type);
  },
  getBrowserStatus: async ({ browserId }) => {
    logger.info(`GET /browser/${browserId}/status - getting browser status`);
    return (Object.keys(state.browsers).includes(browserId.toString()));
  },
  getBrowsers: async () => {
    logger.info("GET /browsers - getting active browsers");
    return Object.keys(state.browsers).map(parseInt);
  },
  reboot: async () => {
    logger.info("POST /reboot - rebooting device");
    service.reboot();
    return true;
  },
  shutdown: async () => {
    logger.info("POST /shutdown - shutting down device");
    service.shutdown();
    return true;
  },
  execute: async ({ command }) => {
    logger.info(`POST /execute - executing command ${command}`);
    return service.execute(command);
  },
  screenshot: async ({
    method,
    screens
  }) => {
    logger.info(`POST /screenshot - taking screenshot of screens ${screens.join(", ")} via the ${method} method`);
    return service.screenshot(method, screens);
  },
  openBrowser: async ({ displayId, url }) => {
    logger.info(`POST /browser - opening browser on display ${displayId} with url ${url}`);

    const idx = service.openBrowser(url, displayId);

    if (idx === null) throw new Error("Unable to open browser");

    const browserId = Math.max(...state.browsers.keys()) + 1;
    state.browsers.set(browserId, { idx });

    return browserId;
  },
  closeBrowser: async ({ browserId }) => {
    logger.info(`DELETE /browser/${browserId} - closing browser`);
    const browser = state.browsers.get(browserId);
    if (browser === undefined) throw new Error(`No browser with ID: ${browserId}`);

    service.closeBrowser(browser);
    const isDeleted = state.browsers.delete(browserId);
    if (!isDeleted) throw new Error(`Unable to delete browser with ID: ${browserId}`);
    return true;
  },
  closeBrowsers: async () => {
    logger.info("DELETE /browsers - closing all browsers");
    for (let browser of state.browsers.values()) {
      service.closeBrowser(browser);
    }
    state.browsers.clear();
    return true;
  }
};

export default controller;