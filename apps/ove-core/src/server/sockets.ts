/* global process */

import { server } from "./server";
import { env, logger } from "../env";
import { instrument } from "@socket.io/admin-ui";
import { Server, type ServerOptions } from "socket.io";

export const io: Server = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "DELETE"]
  }, path: `${env.SOCKET_PATH ?? ""}/${env.API_VERSION}`
} as Partial<ServerOptions>);

const auth = env.SOCKET_ADMIN === undefined ? false : {
  type: "basic" as const,
  username: env.SOCKET_ADMIN.USERNAME,
  password: env.SOCKET_ADMIN.PASSWORD
};
instrument(io, {
  auth,
  mode: process.env.NODE_ENV === "production" ? "production" : "development"
});

io.on("connection", socket => {
  logger.info(`New client connected: ${socket.id}`);

  socket.on("disconnect", reason =>
    logger.info(`${socket.id} disconnecting with reason: ${reason}`));
});
