import { z } from "zod";
import { Service } from "@ove/ove-client-control";
import { procedure, router } from "./trpc";
import { DesktopCapturerSource } from "electron";
import { NodeInfoSchema, ResponseSchema } from "@ove/ove-types";


const service = Service.default();

export const init = (
  createWindow: (displayId?: number) => void,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>
) => {
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
    .output(ResponseSchema)
    .query(() => {
      return service.getStatus();
    }),
  getInfo: procedure
    .meta({ openapi: { method: "GET", path: "/info" } })
    .input(z.object({
      type: z.string().regex(/^(system|cpu|memory|battery|graphics|os|processes|fs|usb|printer|audio|network|wifi|bluetooth|docker|vbox)$/gi).optional()
    }).optional())
    .output(NodeInfoSchema)
    .query(async ({ input }) => await service.getInfo(input?.type)),
  getBrowserStatus: procedure
    .meta({ openapi: { method: "GET", path: "/browser/{id}/status" } })
    .input(z.object({
      id: z.number().min(0)
    }))
    .output(ResponseSchema)
    .query(({ ctx, input: { id } }) => {
      if (Object.keys(ctx.browsers).includes(id.toString())) {
        return { response: "open" };
      } else {
        return { response: "closed" };
      }
    }),
  getBrowsers: procedure
    .meta({ openapi: { method: "GET", path: "/browsers" } })
    .input(z.undefined())
    .output(z.array(z.number()))
    .query(({ ctx }) => {
      return Object.keys(ctx.browsers).map(parseInt);
    }),
  shutdown: procedure
    .meta({ openapi: { method: "POST", path: "/shutdown" } })
    .input(z.void())
    .output(z.string())
    .mutation(() => {
      return service.shutdown().toString();
    }),
  reboot: procedure
    .meta({ openapi: { method: "POST", path: "/reboot" } })
    .input(z.void())
    .output(z.string())
    .mutation(async () => {
      return service.reboot().toString();
    }),
  execute: procedure
    .meta({ openapi: { method: "POST", path: "/execute" } })
    .input(z.object({
      command: z.string()
    }))
    .output(z.string())
    .mutation(({ input: { command } }) => {
      return service.execute(command).toString();
    }),
  screenshot: procedure
    .meta({ openapi: { method: "POST", path: "/screenshot" } })
    .input(z.object({
      method: z.string().regex(/^(local|return|upload)$/gi),
      screens: z.array(z.number())
    }))
    .output(z.array(z.string()))
    .mutation(({ input }) => {
      if (input.method === "upload") {
        throw new Error("File upload is not currently implemented, " +
          "please use the 'local' or 'return' methods");
      }
      return service.screenshot(input.method, input.screens);
    }),
  openBrowser: procedure
    .meta({ openapi: { method: "POST", path: "/browser" } })
    .input(z.object({ displayId: z.number().optional() }))
    .output(z.number())
    .mutation(async ({ ctx, input: { displayId } }) => {
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
    .output(z.boolean())
    .mutation(({ ctx, input: { id } }) => {
      service.closeBrowser(ctx.browsers[id]);
      delete ctx.browsers[id];
      return true;
    }),
  closeBrowsers: procedure
    .meta({ openapi: { method: "DELETE", path: "/browsers" } })
    .input(z.undefined())
    .output(z.boolean())
    .mutation(({ ctx }) => {
      service.closeBrowsers(Object.values(ctx.browsers));
      ctx.browsers = {};
      return true;
    })
});

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
