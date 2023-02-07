import { Server } from "socket.io";
import { ServerToClientEvents, ClientToServerEvents } from "../../../libs/ove-types/src/lib/hardware";
import { logger, server } from "./app";

export let io: Server | undefined;

io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }
});

io.on("connection", socket => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on("disconnect", reason => logger.info(`${socket.id} disconnecting with reason: ${reason}`));
});
