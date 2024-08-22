import type { Namespace } from "socket.io";
import type { Project, Section } from "@prisma/client";
import { prisma } from "./db";
import { io as SocketServer } from "./sockets";
import { raise } from "@ove/ove-utils";
import { logger } from "../env";

type ObservatoryState = {
  project: Project
  layout: Section[]
  state: string
}

export const state = {
  hardwareClients: new Map<string, string>(),
  bridgeClients: new Map<string, string>(),
  rendering: new Map<string, {
    state: ObservatoryState | null,
    clients: {
      state: Map<string, { type: "controller" | "view" }>,
      io: Namespace<{
        setState: (state: string) => void
      }, {
        init: (state: ObservatoryState | null) => void
        createSection: (section: Section) => void
        deleteSection: (id: string) => void
      }>
    },
    sections: Map<string, {
      state: object
      clients: {
        state: Map<string, { type: "controller" | "view" }>,
        io: Namespace<{}, {}>
      }
    }>
  }>()
};

const initSectionSockets = (observatory: string, id: string) => {

}

const initObservatorySockets = (observatory: string) => {
  const observatoryState = state.rendering.get(observatory);
  if (observatoryState === undefined) {
    return raise("Missing observatory state");
  }

  observatoryState.clients.io.use((socket, next) => {
    const { token } = socket.handshake.auth;
    prisma.user.findUnique({
      where: {
        username: observatory
      }
    }).then(user => {
      if (user?.role === "bridge" && token.trim() === user.password.trim()) {
        next();
      } else {
        next(new Error("UNAUTHORIZED"));
      }
    });
  });

  observatoryState.clients.io.on("connection", socket => {
    logger.info(`Socket ID: ${socket.handshake.auth.username}
     connected via ${observatoryState.clients.io.name}`);
    observatoryState.clients.state.set(socket.id, { type: socket.handshake.auth.type });
    socket.emit("init", observatoryState.state);

    socket.on("disconnect", reason => {
      logger.info(`${socket.handshake.auth.username}
       disconnected with reason: ${reason}`);
      observatoryState.clients.state.delete(socket.id);
    });

    socket.on("setState", s => {
      const observatoryState = state.rendering.get(observatory);
      if (observatoryState === undefined || observatoryState.state === null) {
        return raise("Missing observatory state");
      }

      for (const section of observatoryState.state.layout) {
        if (section.states.includes(observatoryState.state.state)) {
          if (section.states.includes(s)) continue;
          observatoryState.clients.io.emit("deleteSection", section.id);
          observatoryState.sections.delete(section.id);
        } else if (section.states.includes(s)) {
          const sectionIO = SocketServer.of(`/socket/render/${observatory}/${section.id}`);
          observatoryState.clients.io.emit("createSection", section);
          observatoryState.sections.set(section.id, {
            state: {layout: section},
            clients: {
              state: new Map(),
              io: sectionIO
            }
          });
          initSectionSockets(observatory, section.id);
        }
      }
    });
  });
};

prisma.user.findMany({ where: { role: "bridge" } }).then((users) => {
  for (const user of users) {
    const io = SocketServer.of(`/socket/render/${user.username}`);
    state.rendering.set(user.username, {
      state: null,
      clients: {
        state: new Map(),
        io
      },
      sections: new Map()
    });
    initObservatorySockets(user.username);
  }
});
