import type { Namespace } from "socket.io";
import type { Section } from ".prisma/client";

export type ObservatoryState = {
  sections: Section[];
  state: string;
  type: "observatory"
};

export type SectionState = {
  section: Section;
  type: "section";
};

export const state = {
  otps: new Set<string>(),
  hardwareClients: new Map<string, string>(),
  bridgeClients: new Map<string, string>(),
  rendering: new Map<string, {
    state: ObservatoryState | SectionState;
    clients: Namespace;
  }>(),
};
