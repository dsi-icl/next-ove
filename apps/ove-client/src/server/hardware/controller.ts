/* global setInterval, clearInterval */

import service from "./service";
import { env, logger } from "../../env";
import { state, updatePin } from "../state";
import { type OutboundAPI } from "../../ipc-routes";
import { type TClientService } from "@ove/ove-types";
import { type DesktopCapturerSource } from "electron";

export const init = (
  createWindow: () => Promise<number[]>,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>,
  closeWindow: (windowId: number) => boolean | null,
  reloadWindow: (windowId: number) => void,
  reloadWindows: () => void,
  triggerIPC: OutboundAPI
) => {
  service.init(createWindow, takeScreenshots, closeWindow,
    reloadWindow, reloadWindows);

  if (env.AUTHORISED_CREDENTIALS === undefined && updatePin !== null) {
    state.pinUpdateCallback = triggerIPC["updatePin"];
    state.pinUpdateHandler = setInterval(updatePin, env.PIN_UPDATE_DELAY);
  }
};

const controller: TClientService = {
  getStatus: async () => {
    logger.info("GET /status - getting service's status");
    return "on";
  },
  getInfo: async ({ type }) => {
    logger.info(`GET /info?type=${type ?? "general"}
     - getting device information`);
    return service.getInfo(type);
  },
  getBrowsers: async () => {
    logger.info("GET /browsers - getting active browsers");
    return Object.fromEntries(state.browsers.entries());
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
  openBrowsers: async () => {
    logger.info("POST /browser - opening browsers");

    if (state.pinUpdateHandler !== null) {
      clearInterval(state.pinUpdateHandler);
    }

    const idxs = await service.openBrowser();

    if (idxs.length === 0) throw new Error("Unable to open browser");

    return idxs;
  },
  closeBrowsers: async () => {
    logger.info("DELETE /browsers - closing all browsers");
    if (state.pinUpdateHandler === null && updatePin !== null) {
      state.pinUpdateHandler = setInterval(updatePin, env.PIN_UPDATE_DELAY);
    }
    service.closeBrowsers(state.browsers.keys());
    state.browsers.clear();
    return true;
  },
  reloadBrowser: async ({ browserId }) => {
    logger.info(`POST /browser/${browserId}/reload - reloading browser`);
    if (!state.browsers.has(browserId)) {
      throw new Error(`No browser with ID: ${browserId}`);
    }
    return service.reloadBrowser(browserId);
  },
  reloadBrowsers: async () => {
    logger.info("POST /browsers/reload - reloading browsers");
    return service.reloadBrowsers();
  },
  setWindowConfig: async ({ config }) => {
    logger.info("POST /env/windowConfig - setting window config");
    env.WINDOW_CONFIG = config;
    return true;
  },
  getWindowConfig: async () => {
    logger.info("GET /env/windowConfig - getting window config");
    return env.WINDOW_CONFIG;
  }
};

export default controller;
