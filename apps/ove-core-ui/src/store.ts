import {create} from "zustand";
import { type Tokens } from "@ove/ove-types";
import { Json } from "@ove/ove-utils";

type Store = {
  tokens: Tokens | null
  setTokens: (tokens: Tokens | null) => void
}

const getCurrentTokens = () => {
  const stored = localStorage.getItem("tokens");
  if (stored === null) return null;
  return Json.parse<Tokens>(stored);
};

export const useStore = create<Store>(set => ({
  tokens: getCurrentTokens(),
  setTokens: (tokens: Tokens | null) => tokens === null ? set({tokens: null}) : set({tokens: {...tokens}})
}));