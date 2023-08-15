import { Namespace } from "socket.io";
import {
  TSocketInEvents, TSocketOutEvents
} from "@ove/ove-types";
import { io as SocketServer } from "../sockets";
import { setupNamespace } from "../socket-setup";

export const io: Namespace<
  TSocketInEvents, TSocketOutEvents
> = SocketServer.of("/bridge");

setupNamespace("/bridge");
