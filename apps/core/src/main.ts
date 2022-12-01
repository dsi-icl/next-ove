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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ["GET", "POST", "DELETE"]
  }
});

const registerNamespace = (namespace, init, router) => {
  init(io);
  app.use(namespace, router);
};

io.on("connection", socket => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("disconnect", reason => console.log(`${socket.id} disconnecting with reason: ${reason}`));
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
server.listen(port, () => console.log(`Listening at http://localhost:${port}`));
server.on("error", console.error);
