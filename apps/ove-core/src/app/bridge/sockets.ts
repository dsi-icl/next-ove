import { type Namespace } from "socket.io";
import {
  type TSocketInEvents, type TSocketOutEvents
} from "@ove/ove-types";
import { io as SocketServer } from "../sockets";
import { setupNamespace } from "../socket-setup";
import { state } from "../state";

export const io: Namespace<
  TSocketInEvents, TSocketOutEvents
> = SocketServer.of("/bridge");

setupNamespace(io, state.bridgeClients);
