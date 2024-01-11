import {
  type CalendarEvent,
  type InboundAPI,
  type PowerMode
} from "@ove/ove-types";
import { useCallback, useEffect } from "react";

export type ModeController = Pick<
  InboundAPI,
  "setManualSchedule" | "setAutoSchedule" | "setEcoSchedule"
>

export const useMode = (
  calendar: CalendarEvent[],
  mode: PowerMode | null,
  setMode: (mode: PowerMode | null) => void,
  controller: ModeController
) => {
  const refreshMode = useCallback((mode_: PowerMode | null) => {
    if (mode_ === null) return;
    switch (mode_) {
      case "manual":
        controller.setManualSchedule({}).catch(console.error);
        break;
      case "auto":
        controller.setAutoSchedule({}).catch(console.error);
        break;
      case "eco":
        controller.setEcoSchedule({ ecoSchedule: calendar })
          .catch(console.error);
        break;
    }
  }, [calendar, controller]);

  useEffect(() => {
    refreshMode(mode);
  }, [calendar, mode, refreshMode]);

  return {
    setManual: () => setMode("manual"),
    setAuto: () => setMode("auto"),
    setEco: () => setMode("eco")
  };
};
