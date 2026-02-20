import { create } from "zustand";

type LogViews = "logs" | "overview" | "traces";

type Filters = {
  view: LogViews;
  setView: (view: LogViews) => void;
  start: string;
  end: string;
  services: string[];
  status?: string;
  search?: string;
  live: boolean;
  selectedTrace?: string;
  setFilters: (f: Partial<Filters>) => void;
  setSelectedTrace: (trace: string | undefined) => void;
};

export const useLogsStore = create<Filters>((set) => ({
  view: "overview",
  setView: (view) => set({ view }),
  start: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  end: new Date().toISOString(),
  services: [],
  status: undefined,
  search: "",
  live: false,
  selectedTrace: undefined,
  setFilters: (f) => set((state) => ({ ...state, ...f })),
  setSelectedTrace: (trace) => set({ selectedTrace: trace }),
}));