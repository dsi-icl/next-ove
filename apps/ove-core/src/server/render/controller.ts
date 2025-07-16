import { prisma } from "../db";
import { state } from "../state";
import { env, logger } from "../../env";
import { raise } from "@ove/ove-utils";
import { io as SocketServer } from "../sockets";
import type { Namespace } from "socket.io";

const initObservatory = async (
  observatory: string,
) => {
  let observatoryState = state.rendering.get(observatory);
  // allow for virtual observatories
  if (observatoryState === undefined) {
    const io = SocketServer.of(`/socket/render/${observatory}`);
    observatoryState = {
      state: {
        sections: [],
        state: "__DEFAULT__",
        type: "observatory",
      },
      clients: io,
    };
    state.rendering.set(observatory, observatoryState);
    initObservatorySockets(observatory);
  }

  observatoryState.state = { sections: [], state: "__DEFAULT__", type: "observatory" };
  return undefined;
};

const clearObservatory = async (observatory: string) => {
  state.rendering.delete(observatory);
  return undefined;
};

export const initSockets = (stateId: string, clients: Namespace) => {
  clients.on("connection", (socket) => {
    logger.info(`Socket ID: ${socket.handshake.auth.username}
     connected via ${clients.name}`);
    socket.emit("init", state.rendering.get(stateId)?.state ?? {});

    socket.on("disconnect", (reason) => {
      logger.info(`${socket.handshake.auth.username}
       disconnected with reason: ${reason}`);
    });
  });
}

export const initObservatorySockets = (observatory: string) => {
  const observatoryState = state.rendering.get(observatory);
  if (observatoryState === undefined) {
    return raise("Missing observatory state");
  }

  observatoryState.clients.on("connection", (socket) => {
    logger.info(`Socket ID: ${socket.handshake.auth.username}
     connected via ${observatoryState.clients.name}`);
    socket.emit("init", observatoryState.state);

    socket.on("disconnect", (reason) => {
      logger.info(`${socket.handshake.auth.username}
       disconnected with reason: ${reason}`);
    });
  });
};

prisma.service.findMany({ where: { role: "bridge" } }).then((services) => {
  for (const { service } of services) {
    const io = SocketServer.of(`/socket/render/${service}`);
    initSockets(service, io);
    const sectionIO = SocketServer.of(`/socket/render/section-id`);
    initSockets("section-id", sectionIO);
    console.log("Initialising socket:", SocketServer.path(), env.SOCKETS.PATH, env.API_VERSION, `/socket/render/${service}`);
    state.rendering.set(service, {
      state: {
        sections: [],
        state: "__DEFAULT__",
        type: "observatory",
      },
      clients: io,
    });
  }
});

const controller = {
  initObservatory,
  clearObservatory,
};

export default controller;
