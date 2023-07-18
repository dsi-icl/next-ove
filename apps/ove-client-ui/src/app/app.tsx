import "../styles.scss";
import styles from "./app.module.scss";
import "github-markdown-css/github-markdown-light.css";
import { useEffect, useState } from "react";
import { API } from "@ove/ove-client-shared";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    electron: API & {receive: (event: string, listener: (...args: any[]) => void) => void}
  }
}

/**
 * Main application
 * @constructor
 */
export function App() {
  const [pin, setPin] = useState<string>("");

  useEffect(() => {
    window.electron.receive("update-pin", setPin);
  }, []);

  return <h1 className={styles.pin}>{pin}</h1>;
}

export default App;
