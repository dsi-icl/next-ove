/* global setInterval, clearInterval */

import service from "./service";
import { env, logger } from "../../env";
import { state, updatePin } from "../state";
import { type OutboundAPI } from "../../ipc-routes";
import { type TClientService } from "@ove/ove-types";
import { type DesktopCapturerSource } from "electron";
import { assert } from "@ove/ove-utils";

export const init = (
  createWindow: (url?: string, displayId?: number) => string,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>,
  closeWindow: (windowId: string) => boolean | null,
  triggerIPC: OutboundAPI
) => {
  // TODO: if authorised, load rendering page
  service.init(createWindow, takeScreenshots, closeWindow);

  if (env.AUTHORISED_CREDENTIALS === undefined && updatePin !== null) {
    state.pinUpdateCallback = triggerIPC["updatePin"];
    state.pinUpdateHandler = setInterval(updatePin, env.PIN_UPDATE_DELAY);
  }
};

const controller: TClientService = {
  getStatus: async () => {
    logger.info("GET /status - getting service's status");
    return true;
  },
  getInfo: async ({ type }) => {
    logger.info(`GET /info?type=${type ?? "general"}
     - getting device information`);
    return service.getInfo(type);
  },
  getBrowser: async ({ browserId }) => {
    logger.info(`GET /browser/${browserId}`);
    return assert(state.browsers.get(browserId));
  },
  getBrowsers: async () => {
    logger.info("GET /browsers - getting active browsers");
    return state.browsers;
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
    logger.info(`POST /screenshot - taking screenshot of screens 
    ${screens.join(", ")} via the ${method} method`);
    return service.screenshot(method, screens);
  },
  openBrowser: async ({ displayId, url }) => {
    logger.info(`POST /browser - opening browser on display 
    ${displayId} with url ${url}`);

    if (state.pinUpdateHandler !== null) {
      clearInterval(state.pinUpdateHandler);
    }

    const idx = service.openBrowser(url, displayId);

    if (idx === null) throw new Error("Unable to open browser");

    const browserId = Array.from(state.browsers.keys())
      .reduce((acc, x) => x > acc ? x : acc, 0);
    state.browsers.set(
      browserId, { displayId: displayId ?? -1, url, windowId: idx });

    return browserId;
  },
  closeBrowser: async ({ browserId }) => {
    logger.info(`DELETE /browser/${browserId} - closing browser`);
    const browser = state.browsers.get(browserId);
    if (browser === undefined) {
      throw new Error(`No browser with ID: ${browserId}`);
    }

    if (state.browsers.size === 1 &&
      state.pinUpdateHandler === null && updatePin !== null) {
      state.pinUpdateHandler = setInterval(updatePin, env.PIN_UPDATE_DELAY);
    }
    service.closeBrowser(browser.windowId);
    const isDeleted = state.browsers.delete(browserId);
    if (!isDeleted) {
      throw new Error(`Unable to delete browser with ID: ${browserId}`);
    }
    return true;
  },
  closeBrowsers: async () => {
    logger.info("DELETE /browsers - closing all browsers");
    if (state.pinUpdateHandler === null && updatePin !== null) {
      state.pinUpdateHandler = setInterval(updatePin, env.PIN_UPDATE_DELAY);
    }
    service.closeBrowsers(state.browsers.values());
    state.browsers.clear();
    return true;
  }
};

export default controller;
