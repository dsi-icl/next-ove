import { z } from "zod";
import { Service } from "@ove/ove-client-control";
import { procedure, router } from "./trpc";
import { DesktopCapturerSource } from "electron";
import { InfoSchema } from "@ove/ove-types";

const service = Service.default();

export const init = (createWindow: (displayId?: number) => void, takeScreenshots: () => Promise<DesktopCapturerSource[]>) => {
  service.init(createWindow, takeScreenshots);
};

export const appRouter = router({
  home: procedure
    .meta({ openapi: { method: "GET", path: "/" } })
    .input(z.void())
    .output(z.object({
      message: z.string()
    }))
    .query(() => {
      return service.getWelcome();
    }),
  getStatus: procedure
    .meta({ openapi: { method: "GET", path: "/status" } })
    .input(z.void())
    .output(z.object({
      status: z.string()
    }))
    .query(() => {
      return service.getStatus();
    }),
  getInfo: procedure
    .meta({ openapi: { method: "GET", path: "/info" } })
    .input(z.object({
      type: z.string().regex(/^(system|cpu|memory|battery|graphics|os|processes|fs|usb|printer|audio|network|wifi|bluetooth|docker|vbox)$/gi)
    }).optional())
    .output(InfoSchema)
    .query(async ({ input }) => await service.getInfo(input?.type)),
  getBrowserStatus: procedure
    .meta({ openapi: { method: "GET", path: "/browser/{id}/status" } })
    .input(z.object({
      id: z.number().min(0)
    }))
    .output(z.object({ status: z.string() }))
    .query(({ ctx, input: { id } }) => {
      if (Object.keys(ctx.browsers).includes(id.toString())) {
        return { status: "open" };
      } else {
        return { status: "closed" };
      }
    }),
  getBrowsers: procedure
    .meta({ openapi: { method: "GET", path: "/browsers" } })
    .input(z.undefined())
    .output(z.array(z.number()))
    .query(({ctx}) => {
      return Object.keys(ctx.browsers).map(parseInt);
    }),
  shutdown: procedure
    .meta({ openapi: { method: "POST", path: "/shutdown" } })
    .input(z.void())
    .output(z.string())
    .query(() => {
      return JSON.stringify(service.shutdown().toJSON());
    }),
  reboot: procedure
    .meta({ openapi: { method: "POST", path: "/reboot" } })
    .input(z.void())
    .output(z.string())
    .query(async () => {
      return JSON.stringify(service.reboot().toJSON());
    }),
  execute: procedure
    .meta({ openapi: { method: "POST", path: "/execute" } })
    .input(z.object({
      command: z.string()
    }))
    .output(z.string())
    .query(({ input: { command } }) => {
      return JSON.stringify(service.execute(command).toJSON());
    }),
  screenshot: procedure
    .meta({ openapi: { method: "POST", path: "/screenshot" } })
    .input(z.object({
      method: z.string().regex(/^(local|return|upload)$/gi),
      screens: z.array(z.number()),
      format: z.string().optional()
    }))
    .output(z.array(z.string()))
    .query(({ input }) => {
      if (input.method === "upload") {
        throw new Error("File upload is not currently implemented, please use the 'local' or 'return' methods");
      }
      return service.screenshot(input.method, input.screens, input.format);
    }),
  openBrowser: procedure
    .meta({ openapi: { method: "POST", path: "/browser" } })
    .input(z.object({displayId: z.number().optional()}))
    .output(z.number())
    .query(async ({ctx, input: {displayId}}) => {
      service.openBrowser(displayId);
      const browserId = Object.keys(ctx.browsers).length;
      ctx.browsers[browserId] = {
        controller: new AbortController()
      };

      return browserId;
    }),
  closeBrowser: procedure
    .meta({ openapi: { method: "DELETE", path: "/browser/{id}" } })
    .input(z.object({
      id: z.number().min(0)
    }))
    .output(z.object({}))
    .query(({ ctx, input: { id } }) => {
      service.closeBrowser(ctx.browsers[id]);
      delete ctx.browsers[id];
      return {};
    }),
  closeBrowsers: procedure
    .meta({ openapi: { method: "DELETE", path: "/browsers" } })
    .input(z.undefined())
    .output(z.object({}))
    .query(({ctx}) => {
      service.closeBrowsers(Object.values(ctx.browsers));
      ctx.browsers = {};
      return {};
    })
});

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
