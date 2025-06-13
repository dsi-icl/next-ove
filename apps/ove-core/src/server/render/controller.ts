import { prisma } from "../db";
import { state } from "../state";
import { logger } from "../../env";
import { raise } from "@ove/ove-utils";
import { io as SocketServer } from "../sockets";
import type { Project, Section } from ".prisma/client";

const initObservatory = async (
  observatory: string,
  project: Project,
  layout: Section[],
) => {
  let observatoryState = state.rendering.get(observatory);
  // allow for virtual observatories
  if (observatoryState === undefined) {
    const io = SocketServer.of(`/socket/render/${observatory}`);
    observatoryState = {
      state: null,
      clients: {
        state: new Map(),
        io,
      },
      sections: new Map(),
      lastUpdated: new Date(),
      type: "hardware",
    };
    state.rendering.set(observatory, observatoryState);
    initObservatorySockets(observatory);
  }

  observatoryState.state = { project, layout, state: "__DEFAULT__" };
  observatoryState.sections = new Map();
  return undefined;
};

const clearObservatory = async (observatory: string) => {
  state.rendering.delete(observatory);
  return undefined;
};

const initSectionSockets = (observatory: string, id: string) => {
  logger.info(observatory, id);
};

export const initObservatorySockets = (observatory: string) => {
  const observatoryState = state.rendering.get(observatory);
  if (observatoryState === undefined) {
    return raise("Missing observatory state");
  }

  observatoryState.clients.io.on("connection", (socket) => {
    logger.info(`Socket ID: ${socket.handshake.auth.username}
     connected via ${observatoryState.clients.io.name}`);
    observatoryState.clients.state.set(socket.id, {
      type: socket.handshake.auth.type,
    });
    socket.emit("init", observatoryState.state);

    socket.on("disconnect", (reason) => {
      logger.info(`${socket.handshake.auth.username}
       disconnected with reason: ${reason}`);
      observatoryState.clients.state.delete(socket.id);
    });

    socket.on("setState", (s) => {
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
          const sectionIO = SocketServer.of(
            `/socket/render/${observatory}/${section.id}`,
          );
          observatoryState.clients.io.emit("createSection", section);
          observatoryState.sections.set(section.id, {
            state: { layout: section },
            clients: {
              state: new Map(),
              io: sectionIO,
            },
          });
          initSectionSockets(observatory, section.id);
        }
      }
    });
  });
};

prisma.service.findMany({ where: { role: "bridge" } }).then((services) => {
  for (const { service } of services) {
    const io = SocketServer.of(`/socket/render/${service}`);
    state.rendering.set(service, {
      state: {
        project: {
          id: "project-id",
          description: "Project description.",
          creatorId: "example-user",
          created: new Date(),
          updated: new Date(),
          title: "Test Project",
          thumbnail: null,
          publications: [],
          presenterNotes: "",
          notes: "",
          bucket: null,
          tags: [],
          isPublic: true,
        },
        layout: [
          {
            id: "section-id",
            width: 0.2,
            height: 0.2,
            x: 0,
            y: 0,
            asset: "https://www.bbc.co.uk",
            assetId: null,
            dataType: "html",
            states: ["__DEFAULT__"],
            ordering: 0,
            projectId: "project-id"
          }
        ],
        state: "__DEFAULT__"
      },
      clients: {
        state: new Map(),
        io,
      },
      sections: new Map(),
      lastUpdated: new Date(),
      type: "hardware",
    });
    initObservatorySockets(service);
  }
});

const controller = {
  initObservatory,
  clearObservatory,
};

export default controller;
