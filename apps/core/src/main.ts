/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express";
import * as http from "http";
import * as path from "path";
import { init as hardwareInit, router as hardware } from "./app/hardware/hardware";
import { Server } from "socket.io";
import * as cors from "cors";
import {Logging} from "@ove/ove-utils";

const logger = Logging.Logger("core", -1);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST", "DELETE"]
  }
});

const registerNamespace = (namespace, init, router) => {
  init(io, logger);
  app.use(namespace, router);
};

io.on("connection", socket => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on("disconnect", reason => logger.info(`${socket.id} disconnecting with reason: ${reason}`));
});

app.use(cors({origin: '*'}));

app.use((req, res, next) => {
  req["io"] = io;
  return next();
})
app.use("/assets", express.static(path.join(__dirname, "assets")));

registerNamespace("/hardware", hardwareInit, hardware);

app.get("/", (req, res) => res.send({ message: "Welcome to core!" }));

const port = process.env.port || 3333;
server.listen(port, () => logger.info(`Listening at http://localhost:${port}`));
server.on("error", logger.error);
