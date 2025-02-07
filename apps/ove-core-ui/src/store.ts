import { create } from "zustand";
import { Json } from "@ove/ove-utils";
import type { User } from "@prisma/client";
import type { Tokens } from "@ove/ove-types";

type Store = {
  tokens: Tokens | null
  setTokens: (tokens: Tokens | null) => void
  user: Omit<User, "password"> | null
  setUser: (user: Omit<User, "password"> | null) => void
  observatory: string | null
  setObservatory: (observatory: string | null) => void
}

const getCurrentTokens = () => {
  const stored = localStorage.getItem("tokens");
  if (stored === null) return null;
  return Json.parse<Tokens>(stored);
};

export const useStore = create<Store>(set => ({
  tokens: getCurrentTokens(),
  setTokens: tokens => set({ tokens }),
  user: null,
  setUser: user => set({ user }),
  observatory: null,
  setObservatory: observatory => set({ observatory })
}));
