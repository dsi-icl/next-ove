import { env } from "../../env";
import { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";

import styles from "./launcher.module.scss";
import Projects from "./projects";

const Launcher = ({loggedIn}: {loggedIn: boolean}) => {
  const [mode, setMode] = useState<"legacy" | "modern">("legacy");

  return <main className={styles.main} style={{ position: "relative" }}>
    <button style={{ position: "absolute", top: "0.5rem", left: "0.5rem" }}
            onClick={() => setMode(cur => cur === "legacy" ? "modern" : "legacy")}>
      {mode === "legacy" ? <ToggleLeft color="white" /> :
        <ToggleRight color="white" />}
    </button>
    {mode === "legacy" ?
      <iframe src={env.PROJECT_LAUNCHER} title="Project Launcher"></iframe>
      : <div className={styles.launcher}>{loggedIn ? <Projects /> : <></>}</div>}
  </main>;
};

export default Launcher;
