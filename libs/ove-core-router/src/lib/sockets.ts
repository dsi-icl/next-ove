import { Server } from "socket.io";
import {
  HardwareServerToClientEvents,
  HardwareClientToServerEvents
} from "@ove/ove-types";
import { server } from "./app";

export const io: Server | undefined = new Server<
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
>(
  server,
  { cors: { origin: "*", methods: ["GET", "POST", "DELETE"] } }
);

io.on("connection", socket => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("disconnect", reason =>
    console.log(`${socket.id} disconnecting with reason: ${reason}`));
});
