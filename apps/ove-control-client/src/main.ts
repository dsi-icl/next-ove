/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express";
import * as path from "path";
import * as controller from "./app/controller";
import { logger } from "./app/utils";
import { Server } from "socket.io";

let clients = [];

const app = express();

app.use("/assets", express.static(path.join(__dirname, "assets")));

app.get("/", (req, res) => {
  res.send({ message: "Welcome to control-client!" });
});

const init = () => {
  logger.info("Initialising Hardware");
  const namespace = io.of("/browser");

  namespace.on("connection", socket => {
    logger.info(`${socket.id} connected via /hardware`);
    logger.debug(`Socket ID: ${socket.handshake.auth.name}`);
    clients = { ...clients, [socket.handshake.auth.name]: socket.id };
    logger.debug(JSON.stringify(clients));

    socket.on("disconnect", reason => {
      delete clients[socket.handshake.auth.name];
      logger.debug(JSON.stringify(clients));
      logger.info(`${socket.id} disconnected with reason: ${reason}`);
    });
  });
};

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
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

init();
server.on("error", console.error);
