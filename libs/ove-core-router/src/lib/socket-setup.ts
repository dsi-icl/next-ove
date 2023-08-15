import { PrismaClient } from "@prisma/client";
import { state } from "./state";
import { io } from "./hardware/sockets";
import { Namespace } from "socket.io";

export const setupNamespace = <T extends Namespace>(namespace: string) => {
  io.use(async (socket, next) => {
    const { username, password } = socket.handshake.auth;
    const prisma = new PrismaClient();
    const user = await prisma.auth.findUnique({
      where: {
        username
      }
    });

    if (user?.role === "bridge" && password === user.password) {
      next();
    } else {
      next(new Error("UNAUTHORIZED"));
    }
  });

  io.on("connection", socket => {
    console.log(`Socket ID: ${socket.handshake.auth.username} connected via ${namespace}`);
    state.hardwareClients.set(socket.handshake.auth.username, socket.id);

    socket.on("disconnect", reason => {
      console.log(`${socket.handshake.auth.username} disconnected with reason: ${reason}`);
      state.hardwareClients.delete(socket.handshake.auth.username);
    });
  });
}