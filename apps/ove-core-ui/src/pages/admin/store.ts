import { create } from "zustand";

export type AdminView = "overview" | "create-user" | "user-overview";

type AdminStore = {
  view: AdminView;
  setView: (view: AdminView) => void;
};

export const useAdminStore = create<AdminStore>((set) => {
  return {
    view: "overview",
    setView: (view) => set({ view }),
  };
});
