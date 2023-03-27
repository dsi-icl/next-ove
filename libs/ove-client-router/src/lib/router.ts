import { procedure, router } from "./trpc";
import { DesktopCapturerSource } from "electron";
import { Service } from "@ove/ove-client-control";
import { ClientAPIRoutes, ID } from "@ove/ove-types";

const service = Service.default();

export const init = (
  createWindow: (displayId?: ID) => void,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>
) => {
  service.init(createWindow, takeScreenshots);
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
    .meta({ openapi: { method: "GET", path: "/browser/{id}/status" } })
    .input(ClientAPIRoutes.getBrowserStatus.args)
    .output(ClientAPIRoutes.getBrowserStatus.client)
    .query(({ ctx, input: { browserId } }) => {
      return (Object.keys(ctx.browsers).includes(browserId.toString()));
    }),
  getBrowsers: procedure
    .meta({ openapi: { method: "GET", path: "/browsers" } })
    .input(ClientAPIRoutes.getBrowsers.args)
    .output(ClientAPIRoutes.getBrowsers.client)
    .query(({ ctx }) => {
      return Object.keys(ctx.browsers).map(parseInt);
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
    .meta({ openapi: { method: "GET", path: "/screenshot" } })
    .input(ClientAPIRoutes.screenshot.args)
    .output(ClientAPIRoutes.screenshot.client)
    .mutation(({ input: { method, screens } }) => {
      return service.screenshot(method, screens);
    }),
  openBrowser: procedure
    .meta({ openapi: { method: "GET", path: "/browser" } })
    .input(ClientAPIRoutes.openBrowser.args)
    .output(ClientAPIRoutes.openBrowser.client)
    .mutation(async ({ ctx, input: { displayId } }) => {
      service.openBrowser(displayId);
      const browserId = Object.keys(ctx.browsers).length;
      ctx.browsers[browserId] = {
        controller: new AbortController()
      };

      return browserId;
    }),
  closeBrowser: procedure
    .meta({openapi: {method: "DELETE", path: "/browser/{browserId}"}})
    .input(ClientAPIRoutes.closeBrowser.args)
    .output(ClientAPIRoutes.closeBrowser.client)
    .mutation(async ({ctx, input: {browserId}}) => {
      service.closeBrowser(ctx.browsers[browserId]);
      delete ctx.browsers[browserId];
      return true;
    }),
  closeBrowsers: procedure
    .meta({openapi: {method: "DELETE", path: "/browsers"}})
    .input(ClientAPIRoutes.closeBrowsers.args)
    .output(ClientAPIRoutes.closeBrowsers.client)
    .mutation(async ({ctx}) => {
      service.closeBrowsers(Object.values(ctx.browsers));
      ctx.browsers = {};
      return true;
    })
});

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
