/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import * as express from "express";
import * as http from "http";
import * as path from "path";
import hardware from "./app/hardware/hardware";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const registerNamespace = namespace => {
  const namespaceIO = io.of(namespace);

  namespaceIO.on("connection", socket => {
    console.log(`${socket.id} connected via ${namespace}`);

    socket.on("disconnect", reason => console.log(`${socket.id} disconnected with reason: ${reason}`));
  });
};

io.on("connection", socket => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("disconnect", reason => console.log(`${socket.id} disconnecting with reason: ${reason}`));
});

app.use((req, res, next) => {
  req["io"] = io;
  return next();
})
app.use("/assets", express.static(path.join(__dirname, "assets")));

registerNamespace("/hardware");
app.use("/hardware", hardware);

app.get("/", (req, res) => res.send({ message: "Welcome to core!" }));

const port = process.env.port || 3333;
server.listen(port, () => console.log(`Listening at http://localhost:${port}`));
server.on("error", console.error);
