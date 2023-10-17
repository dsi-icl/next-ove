import {create} from "zustand";
import { InfoTypes } from "./utils";
import { Json } from "@ove/ove-utils";
import { type Tokens } from "@ove/ove-types";

type Store = {
  tokens: Tokens | null
  setTokens: (tokens: Tokens | null) => void
  info: {data: object, type: InfoTypes} | { data: object[], type: InfoTypes } | null
  setInfo: (info: {data: object, type: InfoTypes} | { data: object[], type: InfoTypes } | null) => void
  paginationIdx: number
  setPaginationIdx: (paginationIdx: number) => void
}

const getCurrentTokens = () => {
  const stored = localStorage.getItem("tokens");
  if (stored === null) return null;
  return Json.parse<Tokens>(stored);
};

export const useStore = create<Store>(set => ({
  tokens: getCurrentTokens(),
  setTokens: (tokens: Tokens | null) => tokens === null ? set({tokens: null}) : set({tokens: {...tokens}}),
  info: null,
  setInfo: info => set({info}),
  paginationIdx: 0,
  setPaginationIdx: paginationIdx => set({paginationIdx})
}));