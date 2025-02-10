import {
  setSocket,
  socket,
  socketConnectListeners,
  socketDisconnectListeners,
} from "./sockets";
import type { TCallback, TParameters, TSocketOutEvents } from "@ove/ove-types";
import { io } from "socket.io-client";
import { assert } from "@ove/ove-utils";
import { initService } from "./service";
import { controller } from "./controller";
import { initHardware } from "../hardware/hardware-controller";
import { env, logger } from "../../env";

export const initBridge = () => {
  if (
    assert(env).CORE_URL === undefined ||
    assert(env).BRIDGE_NAME === undefined
  )
    return;
  setSocket(
    io(`${assert(env).CORE_URL}/socket/bridge`, {
      auth: {
        username: assert(env).BRIDGE_NAME,
        password: assert(env).PUBLIC_KEY,
      },
      path: `${assert(env).SOCKET_PATH ?? ""}/${assert(env).CORE_API_VERSION}`,
    }),
  );
  if (socket === null) throw new Error("ILLEGAL");

  socket.on("connect", () => {
    assert(logger).info(`${assert(socket).id} connected to /bridge`);
    socketConnectListeners.forEach((x) => x());
  });

  socket.on("disconnect", () => {
    assert(logger).info(`${assert(socket).id} disconnected from /bridge`);
    socketDisconnectListeners.forEach((x) => x());
  });

  const getHandler = <Key extends keyof TSocketOutEvents>(k: Key) => {
    return ((args: TParameters<Key>, callback: TCallback<Key>) => {
      controller[k](args).then((res) => {
        callback(res);
        assert(logger).info(`Handled: ${k}`);
      });
    }) as TSocketOutEvents[Key];
  };

  (Object.keys(controller) as Array<keyof TSocketOutEvents>).forEach((k) => {
    assert(socket).on<typeof k>(k, getHandler(k));
  });

  socket.on("connect_error", (err) =>
    assert(logger).error(`connection error due to ${err.message}`),
  );
};

initService(initBridge, initHardware);
