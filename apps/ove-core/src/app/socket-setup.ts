import { type Namespace } from "socket.io";
import { prisma } from "./db";

export const setupNamespace = <T extends Namespace>(io: T, clients: Map<string, string>) => {
  io.use(async (socket, next) => {
    const { username, password } = socket.handshake.auth;
    const user = await prisma.auth.findUnique({
      where: {
        username
      }
    });

    if (user?.role === "bridge" && password.trim() === user.password.trim()) {
      next();
    } else {
      next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", socket => {
    console.log(`Socket ID: ${socket.handshake.auth.username} connected via ${io.name}`);
    clients.set(socket.handshake.auth.username, socket.id);

    socket.on("disconnect", reason => {
      console.log(`${socket.handshake.auth.username} disconnected with reason: ${reason}`);
      clients.delete(socket.handshake.auth.username);
    });
  });
}