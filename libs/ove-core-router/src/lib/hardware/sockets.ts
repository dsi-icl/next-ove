import { Namespace } from "socket.io";
import {
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
} from "@ove/ove-types";
import { io as SocketServer } from "../sockets";
import { setupNamespace } from "../socket-setup";

export const io: Namespace<
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
> = SocketServer.of("/hardware");

setupNamespace("/hardware");
