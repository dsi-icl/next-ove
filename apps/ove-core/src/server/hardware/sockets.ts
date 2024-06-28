import type {
  THardwareClientToServerEvents,
  THardwareServerToClientEvents
} from "@ove/ove-types";
import { state } from "../state";
import type { Namespace } from "socket.io";
import { io as SocketServer } from "../sockets";
import { setupNamespace } from "../socket-setup";

export const io: Namespace<
  THardwareClientToServerEvents,
  THardwareServerToClientEvents
> = SocketServer.of("/socket/hardware");

setupNamespace(io, state.hardwareClients);
