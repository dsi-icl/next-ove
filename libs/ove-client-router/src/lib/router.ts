/* global console */

import { procedure, router } from "./trpc";
import { DesktopCapturerSource } from "electron";
import { Service } from "@ove/ove-client-control";
import { Browser, ClientAPIRoutes, ID } from "@ove/ove-types";

const service = Service.default();

const state: { browsers: { [browserId: ID]: Browser } } = { browsers: {} };

export const init = (
  createWindow: (url?: string, displayId?: ID) => string,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>,
  closeWindow: (idx: string) => void
) => {
  service.init(createWindow, takeScreenshots, closeWindow);
};

export const appRouter = router({
  getStatus: procedure
    .meta({ openapi: { method: "GET", path: "/status" } })
    .input(ClientAPIRoutes.getStatus.args)
    .output(ClientAPIRoutes.getStatus.client)
    .query(() => {
      return true;
    }),
  getInfo: procedure
    .meta({ openapi: { method: "GET", path: "/info" } })
    .input(ClientAPIRoutes.getInfo.args)
    .output(ClientAPIRoutes.getInfo.client)
    .query(({ input: { type } }) => {
      return service.getInfo(type);
    }),
  getBrowserStatus: procedure
    .meta({ openapi: { method: "GET", path: "/browser/{browserId}/status" } })
    .input(ClientAPIRoutes.getBrowserStatus.args)
    .output(ClientAPIRoutes.getBrowserStatus.client)
    .query(({ input: { browserId } }) => {
      return (Object.keys(state.browsers).includes(browserId.toString()));
    }),
  getBrowsers: procedure
    .meta({ openapi: { method: "GET", path: "/browsers" } })
    .input(ClientAPIRoutes.getBrowsers.args)
    .output(ClientAPIRoutes.getBrowsers.client)
    .query(() => {
      return Object.keys(state.browsers).map(parseInt);
    }),
  reboot: procedure
    .meta({ openapi: { method: "POST", path: "/reboot" } })
    .input(ClientAPIRoutes.reboot.args)
    .output(ClientAPIRoutes.reboot.client)
    .mutation(() => {
      return service.reboot();
    }),
  shutdown: procedure
    .meta({ openapi: { method: "GET", path: "/start" } })
    .input(ClientAPIRoutes.shutdown.args)
    .output(ClientAPIRoutes.shutdown.client)
    .mutation(() => {
      return service.shutdown();
    }),
  execute: procedure
    .meta({ openapi: { method: "GET", path: "/execute" } })
    .input(ClientAPIRoutes.execute.args)
    .output(ClientAPIRoutes.execute.client)
    .mutation(({ input: { command } }) => {
      return service.execute(command);
    }),
  screenshot: procedure
    .meta({ openapi: { method: "POST", path: "/screenshot" } })
    .input(ClientAPIRoutes.screenshot.args)
    .output(ClientAPIRoutes.screenshot.client)
    .mutation(({ input: { method, screens } }) => {
      return service.screenshot(method, screens);
    }),
  openBrowser: procedure
    .meta({ openapi: { method: "POST", path: "/browser" } })
    .input(ClientAPIRoutes.openBrowser.args)
    .output(ClientAPIRoutes.openBrowser.client)
    .mutation(async ({ input: { displayId, url } }) => {
      const idx = service.openBrowser(url, displayId);
      const browserId = Object.keys(state.browsers).length;
      state.browsers[browserId] = { idx };
      console.log(`Opening browsers: ${JSON.stringify(state.browsers)}`);

      return browserId;
    }),
  closeBrowser: procedure
    .meta({ openapi: { method: "DELETE", path: "/browser/{browserId}" } })
    .input(ClientAPIRoutes.closeBrowser.args)
    .output(ClientAPIRoutes.closeBrowser.client)
    .mutation(async ({ input: { browserId } }) => {
      console.log(`Closing browsers: ${JSON.stringify(state.browsers)}`);
      service.closeBrowser(state.browsers[browserId]);
      delete state.browsers[browserId];
      return true;
    }),
  closeBrowsers: procedure
    .meta({ openapi: { method: "DELETE", path: "/browsers" } })
    .input(ClientAPIRoutes.closeBrowsers.args)
    .output(ClientAPIRoutes.closeBrowsers.client)
    .mutation(async () => {
      service.closeBrowsers(Object.values(state.browsers));
      state.browsers = {};
      return true;
    })
});

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
