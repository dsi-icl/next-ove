import { Namespace } from "socket.io";
import {
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
} from "@ove/ove-types";
import { io as SocketServer } from "../sockets";
import { PrismaClient } from "@prisma/client";
import { state } from "./state";

export const io: Namespace<
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
> = SocketServer.of("/hardware");

io.use(async (socket, next) => {
  const { username, password } = socket.handshake.auth;
  const authorisedUsers = await new PrismaClient().auth.findMany({
    where: {
      role: "bridge"
    }
  });

  if (authorisedUsers.find(user => user.username === username && user.password === password)) {
    next();
  } else {
    next(new Error("UNAUTHORIZED"));
  }
});

io.on("connection", socket => {
  console.log(`Socket ID: ${socket.handshake.auth.username} connected via /hardware`);
  state.clients = {
    ...state.clients,
    [socket.handshake.auth.username]: socket.id
  };

  socket.on("disconnect", reason => {
    console.log(`${socket.handshake.auth.username} disconnected with reason: ${reason}`);
    delete state.clients[socket.handshake.auth.username];
  });
});