import { type Namespace } from "socket.io";
import {
  type THardwareClientToServerEvents,
  type THardwareServerToClientEvents
} from "@ove/ove-types";
import { io as SocketServer } from "../sockets";
import { setupNamespace } from "../socket-setup";
import { state } from "../state";

export const io: Namespace<
  THardwareClientToServerEvents,
  THardwareServerToClientEvents
> = SocketServer.of("/hardware");

setupNamespace(io, state.hardwareClients);
