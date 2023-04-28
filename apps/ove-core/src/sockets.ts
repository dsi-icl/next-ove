import { Server } from "socket.io";
import {
  HardwareServerToClientEvents,
  HardwareClientToServerEvents
} from "@ove/ove-types";
import { logger, server } from "./app";

export const io: Server | undefined = new Server<
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
>(
  server,
  { cors: { origin: "*", methods: ["GET", "POST", "DELETE"] } }
);

io.on("connection", socket => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on("disconnect", reason =>
    logger.info(`${socket.id} disconnecting with reason: ${reason}`));
});
