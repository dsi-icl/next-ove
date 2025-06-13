import type { Namespace } from "socket.io";
import type { Project, Section } from ".prisma/client";

type ObservatoryState = {
  project: Project;
  layout: Section[];
  state: string;
};

export const state = {
  otps: new Set<string>(),
  hardwareClients: new Map<string, string>(),
  bridgeClients: new Map<string, string>(),
  rendering: new Map<
    string,
    {
      state: ObservatoryState | null;
      clients: {
        state: Map<string, { type: "controller" | "view" }>;
        io: Namespace<
          {
            setState: (state: string) => void;
          },
          {
            init: (state: ObservatoryState | null) => void;
            createSection: (section: Section) => void;
            deleteSection: (id: string) => void;
          }
        >;
      };
      sections: Map<
        string,
        {
          state: object;
          clients: {
            state: Map<string, { type: "controller" | "view" }>;
            io: Namespace<object, object>;
          };
        }
      >;
      lastUpdated: Date;
      type: "hardware" | "virtual";
    }
  >(),
};
