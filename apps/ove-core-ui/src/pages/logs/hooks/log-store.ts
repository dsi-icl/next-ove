import { create } from "zustand";

export type Log = {
  id: string;
  message: string;
  appId: string;
  level: "info" | "warning" | "error" | "fatal" | "debug" | "trace";
  date: Date;
};

type LogStore = {
  mode: "live" | "historical";
  logs: Log[];
  addLog: (log: Log) => void;
};

export const useLogStore = create<LogStore>((set) => ({
  mode: "live",
  logs: [],
  addLog: (log) => set((state) => ({ logs: state.logs.concat([log]) })),
}));
