import { create } from "zustand";
import { InfoTypes } from "./utils";
import { Json } from "@ove/ove-utils";
import { type Tokens } from "@ove/ove-types";

type Store = {
  tokens: Tokens | null
  setTokens: (tokens: Tokens | null) => void
  info: { data: object, type: InfoTypes } | {
    data: object[],
    type: InfoTypes
  } | null
  setInfo: (info: { data: object, type: InfoTypes } | {
    data: object[],
    type: InfoTypes
  } | null) => void
  command: string | null
  setCommand: (command: string | null) => void
  clearCommand: () => void
  commandHistory: string[]
  addCommandHistory: (line: string) => void
  clearCommandHistory: () => void
  paginationIdx: number
  setPaginationIdx: (paginationIdx: number) => void
  reset: () => void
}

const getCurrentTokens = () => {
  const stored = localStorage.getItem("tokens");
  if (stored === null) return null;
  return Json.parse<Tokens>(stored);
};

export const useStore = create<Store>(set => ({
  tokens: getCurrentTokens(),
  setTokens: (tokens: Tokens | null) => tokens === null ? set({ tokens: null }) : set({ tokens: { ...tokens } }),
  info: null,
  setInfo: info => set({ info }),
  paginationIdx: 0,
  setPaginationIdx: paginationIdx => set({ paginationIdx }),
  command: null,
  setCommand: command => set({ command }),
  commandHistory: [],
  addCommandHistory: line => set(state => ({ commandHistory: [line, ...state.commandHistory] })),
  clearCommandHistory: () => set({ commandHistory: [] }),
  reset: () => set({
    info: null,
    paginationIdx: 0,
    command: null,
    commandHistory: []
  }),
  clearCommand: () => set({ command: null })
}));