import auth from "./auth";
import { prisma } from "./db";
import { logger } from "../env";
import type { Namespace } from "socket.io";

export const setupNamespace = <T extends Namespace>(
  io: T,
  clients: Map<string, string>,
) => {
  io.use(async (socket, next) => {
    try {
      const { key } = socket.handshake.auth;
      const { role } = await auth.validateApiKey(prisma, key);
      if (!auth.authorize(role, io.name)) {
        next(new Error("UNAUTHORIZED"));
        return;
      }
      next();
    } catch (_e) {
      next(new Error("UNAUTHORIZED"));
    }
  });

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
