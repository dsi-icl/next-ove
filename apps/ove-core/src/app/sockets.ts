import { Server, type ServerOptions } from "socket.io";
import {
  type THardwareServerToClientEvents,
  type THardwareClientToServerEvents
} from "@ove/ove-types";
import { server } from "./app";
import { instrument } from "@socket.io/admin-ui";
import { env } from "../env";
import { Parser } from "@ove/ove-utils";

export const io: Server = new Server<
  THardwareClientToServerEvents,
  THardwareServerToClientEvents
>(
  server,
  { cors: { origin: "*", methods: ["GET", "POST", "DELETE"] }, credentials: false, parser: Parser } as Partial<ServerOptions>
);

const auth = env.SOCKET_ADMIN === undefined ? false : {type: "basic" as const, username: env.SOCKET_ADMIN.USERNAME, password: env.SOCKET_ADMIN.PASSWORD}
instrument(io, {auth, mode: process.env.NODE_ENV === "production" ? "production" : "development"});

io.on("connection", socket => {
  console.log(`New client connected: ${socket.id}`);

  socket.on("disconnect", reason =>
    console.log(`${socket.id} disconnecting with reason: ${reason}`));
});
