import "../styles.scss";
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
  const [appVersion, setAppVersion] = useState("");
  const [pin, setPin] = useState<string>("");

  useEffect(() => {
    window.electron.getAppVersion().then(setAppVersion);
    window.electron.receive("update-pin", setPin);
  }, []);

  return (
    <>
      <article className="markdown-body">
        <h1>OVE Client - v{appVersion}</h1>
        <p>{pin}</p>
      </article>
    </>
  );
}

export default App;
