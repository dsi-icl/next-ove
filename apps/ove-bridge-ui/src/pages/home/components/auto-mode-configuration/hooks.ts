import { useEffect } from "react";

const defaultDaySelection = [false, false, false, false, false, false, false];

export const useAutoSchedule = (setValue: ((k: "start" | "end", v: string) => void) & ((k: "days", v: boolean[]) => void)) => {
  useEffect(() => {
    window.electron.getAutoSchedule().then(autoSchedule => {
      setValue("start" as const, autoSchedule?.wake ?? "");
      setValue("end" as const, autoSchedule?.sleep ?? "");
      setValue("days" as const, autoSchedule?.schedule ?? defaultDaySelection);
    });
  }, []);
};