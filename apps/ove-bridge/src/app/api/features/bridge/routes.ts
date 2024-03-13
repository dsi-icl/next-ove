import {
  type TSocketOutEvents,
  type TParameters,
  type TCallback,
} from "@ove/ove-types";
import { io } from "socket.io-client";
import { assert, Parser } from "@ove/ove-utils";
import { env, logger } from "../../../../env";
import { controller } from "./controller";
import {
  setSocket,
  socket,
  socketConnectListeners,
  socketDisconnectListeners
} from "./sockets";
import { initService } from "./service";
import { initHardware } from "../hardware/hardware-controller";

export const initBridge = () => {
  if (env.CORE_URL === undefined || env.BRIDGE_NAME === undefined) return;
  setSocket(io(`${env.CORE_URL}/bridge`, { autoConnect: false, parser: Parser }));
  if (socket === null) throw new Error("ILLEGAL");
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
    logger.info(`${assert(socket).id} disconnected from /bridge`);
    socketDisconnectListeners.forEach(x => x());
  });

  const getHandler = <Key extends keyof TSocketOutEvents>(k: Key) => {
    return ((args: TParameters<Key>, callback: TCallback<Key>) => {
      controller[k](args).then(res => {
        callback(res);
        logger.info(`Handled: ${k}`);
      });
    }) as TSocketOutEvents[Key];
  };

  (Object.keys(controller) as Array<keyof TSocketOutEvents>).forEach(k => {
    assert(socket).on<typeof k>(k, getHandler(k));
  });

  socket.on("connect_error", err =>
    logger.error(`connection error due to ${err.message}`));
};

initService(initBridge, initHardware);
