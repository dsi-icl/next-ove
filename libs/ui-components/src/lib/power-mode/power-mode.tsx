import React, { useCallback } from "react";
import {
  type CalendarEvent,
  type PowerMode as TPowerMode
} from "@ove/ove-types";
import { type ModeController, useMode } from "./hooks";

import styles from "./power-mode.module.scss";

type PowerModeProps = {
  calendar: CalendarEvent[]
  controller: ModeController,
  mode: TPowerMode | null,
  setMode: (mode: TPowerMode | null) => void
}

const PowerMode = ({ calendar, controller, mode, setMode }: PowerModeProps) => {
  const {
    setManual,
    setAuto,
    setEco
  } = useMode(calendar, mode, setMode, controller);
  const getStyle = useCallback((selection: string) => {
    return { backgroundColor: selection === mode ? "lightgreen" : "lightgrey" };
  }, [mode]);
  return <div className={styles["mode-container"]}
              style={{ marginTop: "auto" }}>
    <button className={styles.button} style={getStyle("manual")}
            onClick={setManual}>
      Manual
    </button>
    <button className={styles.button} style={getStyle("auto")}
            onClick={setAuto}>
      Auto
    </button>
    <button className={styles.button} style={getStyle("eco")} onClick={setEco}>
      Eco
    </button>
  </div>;
};

export default PowerMode;
