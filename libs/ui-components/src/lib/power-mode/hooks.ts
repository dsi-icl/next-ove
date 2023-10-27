import {
  type CalendarEvent,
  type InboundAPI,
  type PowerMode
} from "@ove/ove-types";
import { useEffect, useState } from "react";

export type ModeController = Pick<InboundAPI, "setManualSchedule" | "setAutoSchedule" | "setEcoSchedule" | "getMode">

export const useMode = (calendar: CalendarEvent[], controller: ModeController) => {
  const [mode, setMode] = useState<PowerMode | null>(null);

  const refreshMode = (mode: PowerMode | null) => {
    if (mode === null) return;
    switch (mode) {
      case "manual":
        controller.setManualSchedule({}).catch(console.error);
        break;
      case "auto":
        controller.setAutoSchedule({}).catch(console.error);
        break;
      case "eco":
        controller.setEcoSchedule({ ecoSchedule: calendar }).catch(console.error);
        break;
    }
  };

  useEffect(() => {
    controller.getMode({}).then(mode => {
      if (typeof mode !== "string") return;
      setMode(mode);
    });
  }, []);

  useEffect(() => {
    refreshMode(mode);
  }, [calendar, mode]);

  return {
    mode,
    setManual: () => setMode("manual"),
    setAuto: () => setMode("auto"),
    setEco: () => setMode("eco")
  };
};