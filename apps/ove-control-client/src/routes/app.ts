import { z } from "zod";
import Service from "../app/service";
import { procedure, router } from "../trpc";

const service = Service();

export const appRouter = router({
    home: procedure
      .meta({ openapi: { method: "GET", path: "/" } })
      .query(() => {
        return service.getWelcome();
      }),
    getStatus: procedure
      .meta({ openapi: { method: "GET", path: "/status" } })
      .query(() => {
        return service.getStatus();
      }),
    getInfo: procedure
      .meta({ openapi: { method: "GET", path: "/info" } })
      .input(z.string().regex(/^system|cpu|memory|battery|graphics|os|processes|fs|usb|printer|audio|network|wifi|bluetooth|docker$/gi))
      .query(({ input }) => {
        return service.getInfo(input);
      }),
    getBrowserStatus: procedure
      .meta({ openapi: { method: "GET", path: "/browser/{id}/status" } })
      .input(z.number().min(0).max(service.getBrowsers().length))
      .query(({ input }) => {
        return service.getBrowserStatus(input);
      }),
    getBrowsers: procedure
      .meta({ openapi: { method: "GET", path: "/browsers" } })
      .query(() => {
        return service.getBrowsers();
      }),
    getDisplays: procedure
      .meta({openapi: {method: "GET", path: "/displays"}})
      .query(async () => {
        return await service.getDisplays();
      }),
    shutdown: procedure
      .meta({ openapi: { method: "POST", path: "/shutdown" } })
      .query(() => {
        return service.shutdown();
      }),
    reboot: procedure
      .meta({ openapi: { method: "POST", path: "/reboot" } })
      .query(() => {
        return service.reboot();
      }),
    execute: procedure
      .meta({ openapi: { method: "POST", path: "/execute" } })
      .input(z.string())
      .query(({ input }) => {
        return service.execute(input);
      }),
    screenshot: procedure
      .meta({ openapi: { method: "POST", path: "/screenshot" } })
      .input(z.object({
        method: z.string().regex(/^local|return|upload$/gi),
        screens: z.array(z.string()),
        format: z.string().optional()
      }))
      .query(({ input }) => {
        if (input.method === "upload") {
          throw new Error("File upload is not currently implemented, please use the 'local' or 'return' methods");
        }
        return service.screenshot(input.method, input.screens, input.format);
      }),
    openBrowser: procedure
      .meta({openapi: {method: "POST", path: "/browser"}})
      .query(() => {
        return service.openBrowser();
      }),
    closeBrowser: procedure
      .meta({openapi: {method: "DELETE", path: "/browser/{id}"}})
      .input(z.number().min(0).max(service.getBrowsers().length))
      .query(({input}) => {
        return service.closeBrowser(input);
      }),
    closeBrowsers: procedure
      .meta({openapi: {method: "DELETE", path: "/browsers"}})
      .query(() => {
        return service.closeBrowsers();
      })
  });

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
