import {
  type TSocketOutEvents,
  type TSocketInEvents,
  type TParameters,
  type TCallback,
} from "@ove/ove-types";
import { assert } from "@ove/ove-utils";
import { io, type Socket } from "socket.io-client";
import { env, logger } from "../../../../env";
import { controller } from "./controller";

let socket: Socket<TSocketOutEvents, TSocketInEvents> | null = null;

export const closeSocket = () => {
  if (socket === null) return;
  socket.disconnect();
  socket = null;
};

const socketConnectListeners: (() => void)[] = [];
const socketDisconnectListeners: (() => void)[] = [];

export const registerSocketConnectedListener = (listener: () => void) => {
  socketConnectListeners.push(listener);
};

export const registerSocketDisconnectListener = (listener: () => void) => {
  socketDisconnectListeners.push(listener);
};

export const getSocketStatus = () => socket?.connected ?? false;

export const initBridge = () => {
  if (env.CORE_URL === undefined || env.BRIDGE_NAME === undefined) return;
  socket = io(`ws://${env.CORE_URL}/bridge`, { autoConnect: false });
  socket.auth = {
    username: env.BRIDGE_NAME,
    password: env.PUBLIC_KEY
  };
  socket.connect();

  socket.on("connect", () => {
    logger.info(`${assert(socket).id} connected to /bridge`);
    socketConnectListeners.forEach(x => x());
  });

  socket.on("disconnect", () => {
    console.log(`${assert(socket).id} disconnected from /bridge`);
    socketDisconnectListeners.forEach(x => x());
  });

  const getHandler = <Key extends keyof TSocketOutEvents>(k: Key) => {
    return ((args: TParameters<Key>, callback: TCallback<Key>) => {
      const res = controller[k](args);
      callback(res);
      logger.info(`Handled: ${k}`);
    }) as TSocketOutEvents[Key];
  };

  (Object.keys(controller) as Array<keyof TSocketOutEvents>).forEach(k => {
    assert(socket).on<typeof k>(k, getHandler(k));
  });

  socket.on("connect_error", err => logger.error(`connection error due to ${err.message}`));
};