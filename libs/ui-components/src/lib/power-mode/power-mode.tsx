import { type CalendarEvent } from "@ove/ove-types";
import { type ModeController, useMode } from "./hooks";

import styles from "./power-mode.module.scss";

type PowerModeProps = {
  calendar: CalendarEvent[]
  controller: ModeController
}

const PowerMode = ({calendar, controller}: PowerModeProps) => {
  const { mode, setManual, setAuto, setEco } = useMode(calendar, controller);
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