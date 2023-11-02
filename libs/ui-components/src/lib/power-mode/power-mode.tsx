import { type CalendarEvent, type PowerMode as TPowerMode } from "@ove/ove-types";
import { type ModeController, useMode } from "./hooks";

import styles from "./power-mode.module.scss";

type PowerModeProps = {
  calendar: CalendarEvent[]
  controller: ModeController,
  mode: TPowerMode | null,
  setMode: (mode: TPowerMode | null) => void
}

const PowerMode = ({calendar, controller, mode, setMode}: PowerModeProps) => {
  const { setManual, setAuto, setEco } = useMode(calendar, mode, setMode, controller);
  return <div className={styles["mode-container"]} style={{marginTop: "auto"}}>
    <button className={styles.button}
            style={{ backgroundColor: mode === "manual" ? "lightgreen" : "lightgrey" }}
            onClick={setManual}>Manual
    </button>
    <button className={styles.button}
            style={{ backgroundColor: mode === "auto" ? "lightgreen" : "lightgrey" }}
            onClick={setAuto}>Auto
    </button>
    <button className={styles.button}
            style={{ backgroundColor: mode === "eco" ? "lightgreen" : "lightgrey" }}
            onClick={setEco}>Eco
    </button>
  </div>;
};

export default PowerMode;