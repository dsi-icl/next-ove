import { z } from "zod";
import Service from "../app/service";
import { procedure, router } from "../trpc";

const service = Service();

export const appRouter = router({
  home: procedure
    .meta({ openapi: { method: "GET", path: "/" } })
    .input(z.undefined())
    .output(z.object({
      message: z.string()
    }))
    .query(() => {
      return service.getWelcome();
    }),
  getStatus: procedure
    .meta({ openapi: { method: "GET", path: "/status" } })
    .input(z.undefined())
    .output(z.object({
      status: z.string()
    }))
    .query(() => {
      return service.getStatus();
    }),
  getInfo: procedure
    .meta({ openapi: { method: "GET", path: "/info" } })
    .input(z.object({
      type: z.string().regex(/^system|cpu|memory|battery|graphics|os|processes|fs|usb|printer|audio|network|wifi|bluetooth|docker$/gi).optional()
    }))
    .output(z.any())
    .query(({ input: { type } }) => {
      return service.getInfo(type);
    }),
  getBrowserStatus: procedure
    .meta({ openapi: { method: "GET", path: "/browser/{id}/status" } })
    .input(z.object({
      id: z.number().min(0).max(service.getBrowsers().length)
    }))
    .output(z.string())
    .query(({ input: { id } }) => {
      return service.getBrowserStatus(id);
    }),
  getBrowsers: procedure
    .meta({ openapi: { method: "GET", path: "/browsers" } })
    .input(z.undefined())
    .output(z.array(z.number()))
    .query(() => {
      return service.getBrowsers();
    }),
  getDisplays: procedure
    .meta({ openapi: { method: "GET", path: "/displays" } })
    .input(z.undefined())
    .output(z.array(z.any()))
    .query(async () => {
      return await service.getDisplays();
    }),
  shutdown: procedure
    .meta({ openapi: { method: "POST", path: "/shutdown" } })
    .input(z.undefined())
    .output(z.any())
    .query(() => {
      return service.shutdown();
    }),
  reboot: procedure
    .meta({ openapi: { method: "POST", path: "/reboot" } })
    .input(z.undefined())
    .output(z.any())
    .query(() => {
      return service.reboot();
    }),
  execute: procedure
    .meta({ openapi: { method: "POST", path: "/execute" } })
    .input(z.object({
      command: z.string()
    }))
    .output(z.any())
    .query(({ input: { command } }) => {
      return service.execute(command);
    }),
  screenshot: procedure
    .meta({ openapi: { method: "POST", path: "/screenshot" } })
    .input(z.object({
      method: z.string().regex(/^local|return|upload$/gi),
      screens: z.array(z.string()),
      format: z.string().optional()
    }))
    .output(z.any())
    .query(({ input }) => {
      if (input.method === "upload") {
        throw new Error("File upload is not currently implemented, please use the 'local' or 'return' methods");
      }
      return service.screenshot(input.method, input.screens, input.format);
    }),
  openBrowser: procedure
    .meta({ openapi: { method: "POST", path: "/browser" } })
    .input(z.undefined())
    .output(z.number())
    .query(() => {
      return service.openBrowser();
    }),
  closeBrowser: procedure
    .meta({ openapi: { method: "DELETE", path: "/browser/{id}" } })
    .input(z.object({
      id: z.number().min(0).max(service.getBrowsers().length)
    }))
    .output(z.null())
    .query(({ input: {id} }) => {
      service.closeBrowser(id);
      return null;
    }),
  closeBrowsers: procedure
    .meta({ openapi: { method: "DELETE", path: "/browsers" } })
    .input(z.undefined())
    .output(z.null())
    .query(() => {
      service.closeBrowsers();
      return null;
    })
});

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
