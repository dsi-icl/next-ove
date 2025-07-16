import { env } from "./env";
import type { Socket } from "socket.io-client";
import { createTRPCClient, httpLink } from "@trpc/client";
import type { AppRouter } from "../../ove-core/src/server/router";
import type { Section } from ".prisma/client";

export const params = new URLSearchParams(window.location.search);
if (window.originalRandom !== undefined) {
  Math.random = window.originalRandom;
}

type DataType = "html" | "image" | "map" | "network" | "video" | "web-rtc";
type RendererType = "view" | "controller";

export type State = {
  uuid: string;
  observatory: {
    name: string;
    bounds: { width: number; height: number; rows: number; columns: number; } | undefined;
    row: number;
    column: number;
  };
  state: {
    sections: Section[];
    state: string;
    type: "observatory";
  } | {
    section: Section;
    type: "section";
  } | undefined;
  type: RendererType;
  dataType: DataType;
  socket: Socket | undefined;
};

export const state: State = {
  uuid: "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    },
  ),
  state: undefined,
  observatory: {
    name: params.get("observatory") ?? "",
    bounds: undefined,
    row: parseInt(params.get("row") ?? "-1"),
    column: parseInt(params.get("column") ?? "-1"),
  },
  type: params.get("type") as RendererType,
  dataType: params.get("data-type") as DataType,
  socket: undefined,
};

export const api = createTRPCClient<AppRouter>({
  links: [
    httpLink({
      url: `${env.CORE.SERVER}/api/v${env.CORE_API_VERSION}/trpc`,
      fetch(url, options) {
        return fetch(url, {
          ...options,
          credentials: "include",
        } as Parameters<(typeof fetch)>[1]);
      },
    }),
  ],
});
