/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import { initTRPC } from "@trpc/server";
import * as express from "express";
import * as path from "path";
import * as controller from "./app/controller";
import { logger } from "./app/utils";
import Service from "./app/service";
import { z } from "zod";

const service = Service();

const trpc = initTRPC.create();
const appRouter = trpc
  .router({
    getStatus: trpc.procedure.query(() => {
      return service.getStatus();
    }),
    getInfo: trpc.procedure.input(z.string().regex(/^system|cpu|memory|battery|graphics|os|processes|fs|usb|printer|audio|network|wifi|bluetooth|docker$/gi)).query(({input}) => {
      return service.getInfo(input);
    }),
    getBrowserStatus: trpc.procedure.input(z.number().min(0)).query(({input}) => {
      return service.getBrowserStatus(input);
    }),
    getBrowsers: trpc.procedure.query(() => {
      return service.getBrowsers();
    })
  });

export type AppRouter = typeof appRouter;

const app = express();

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.send({ message: "Welcome to control-client!" });
});

app.get("/status", controller.getStatus);
app.get("/info", controller.getInfo);
app.get("/browser/:id/status", controller.getBrowserStatus);
app.get("/browsers", controller.getBrowsers);

app.post("/shutdown", controller.shutdown);
app.post("/reboot", controller.reboot);
app.post("/execute", controller.execute);
app.post("/screenshot", controller.screenshot);
app.post("/browser", controller.openBrowser);

app.delete("/browser/:id", controller.closeBrowser);
app.delete("/browsers", controller.closeBrowsers);

const port = process.env.port || 3335;
const server = app.listen(port, () => {
  logger.info(`Listening at http://localhost:${port}`);
});

server.on("error", console.error);
