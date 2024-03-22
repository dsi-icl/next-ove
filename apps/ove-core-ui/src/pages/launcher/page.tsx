import { env } from "../../env";
import React, { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";

import styles from "./launcher.module.scss";
import Projects from "./projects";

const Launcher = ({ loggedIn }: { loggedIn: boolean }) => {
  const [mode, setMode] = useState<"legacy" | "modern">("modern");

  return <main className={styles.main} style={{ position: "relative" }}>
    {mode === "legacy" ? <button
      style={{
        position: "absolute", top: "0.5rem",
        left: "0.5rem", zIndex: 2
      }}
      onClick={() => setMode(cur =>
        cur === "legacy" ? "modern" : "legacy")}>
      {mode === "legacy" ? <ToggleLeft color="#002147" /> :
        <ToggleRight color="#002147" />}
    </button> : null}
    {mode === "legacy" ?
      <iframe src={env.PROJECT_LAUNCHER} title="Project Launcher"></iframe> :
      <div className={styles.launcher}>{loggedIn ? <Projects /> : null}</div>}
  </main>;
};

export default Launcher;
