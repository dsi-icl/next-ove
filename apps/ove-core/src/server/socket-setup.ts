import auth from "./auth";
import { prisma } from "./db";
import { logger } from "../env";
import type { Namespace } from "socket.io";
import { socketApiKeyMiddleware } from "@ove/ove-auth";

export const setupNamespace = <T extends Namespace>(
  io: T,
  clients: Map<string, string>,
) => {
  io.use(async (socket, next) =>
    socketApiKeyMiddleware(
      socket.handshake.auth.key,
      prisma,
      next,
      (role: string) => auth.authorize(role, io.name),
      auth.getCredentials(),
    ),
  );

  io.on("connection", (socket) => {
    logger.info(`Socket ID: ${socket.handshake.auth.username}
     connected via ${io.name}`);
    clients.set(socket.handshake.auth.username, socket.id);

    socket.on("disconnect", (reason) => {
      logger.info(`${socket.handshake.auth.username}
       disconnected with reason: ${reason}`);
      clients.delete(socket.handshake.auth.username);
    });
  });
};
