import { create } from "zustand";
import type { User } from ".prisma/client";
import { createJSONStorage, persist } from "zustand/middleware";

type Store = {
  user: Omit<User, "password"> | null;
  setUser: (user: Omit<User, "password"> | null) => void;
  observatory: string | null;
  setObservatory: (observatory: string | null) => void;
};

export const useStore = create<Store>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      observatory: null,
      setObservatory: (observatory) => set({ observatory }),
    }),
    {
      name: "global-store",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
