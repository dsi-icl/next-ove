import { Socket } from "socket.io-client";
import { TSocketInEvents, TSocketOutEvents } from "@ove/ove-types";

export let socket: Socket<TSocketOutEvents, TSocketInEvents> | null = null;

export const setSocket = (
  socket_: Socket<TSocketOutEvents, TSocketInEvents> | null
) => {
  socket = socket_;
};

export const closeSocket = () => {
  if (socket === null) return;
  socket.disconnect();
  socket = null;
};

export const socketConnectListeners: (() => void)[] = [];
export const socketDisconnectListeners: (() => void)[] = [];

export const registerSocketConnectedListener = (listener: () => void) =>
  void socketConnectListeners.push(listener);

export const registerSocketDisconnectListener = (listener: () => void) =>
  void socketDisconnectListeners.push(listener);

export const getSocketStatus = () => socket?.connected ?? false;
