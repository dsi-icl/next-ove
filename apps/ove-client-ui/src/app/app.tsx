import "../styles.scss";
import styles from "./app.module.scss";
import "github-markdown-css/github-markdown-light.css";
import { useEffect, useState } from "react";
import {
  InboundAPI,
  OutboundAPI,
  OutboundAPIChannels
} from "@ove/ove-client-shared";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    electron: InboundAPI & {
      receive: <Key extends keyof OutboundAPI>(
        event: OutboundAPIChannels[Key],
        listener: (...args: Parameters<OutboundAPI[Key]>) =>
          ReturnType<OutboundAPI[Key]>
      ) => void
    };
  }
}

/**
 * Main application
 * @constructor
 */
export function App() {
  const [pin, setPin] =
    useState<string>("");

  useEffect(() => {
    window.electron.receive("update-pin", setPin);
  }, []);

  return <main className={styles.main}><h1 className={styles.pin}>{pin}</h1>
  </main>;
}

export default App;
