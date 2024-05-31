import { state } from "../state";
import type { Namespace } from "socket.io";
import { io as SocketServer } from "../sockets";
import { setupNamespace } from "../socket-setup";
import type { TSocketInEvents, TSocketOutEvents } from "@ove/ove-types";

export const io: Namespace<
  TSocketInEvents, TSocketOutEvents
> = SocketServer.of("/bridge");

setupNamespace(io, state.bridgeClients);
