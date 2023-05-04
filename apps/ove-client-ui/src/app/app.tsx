import "../styles.scss";
import "github-markdown-css/github-markdown-light.css";
import { useEffect, useState } from "react";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    electron: {
      getNotifications: () => Promise<string[]>
      getInfo: (type?: string) => Promise<unknown>
      getAppVersion: () => Promise<string>
    };
  }
}

/**
 * Main application
 * @constructor
 */
export function App() {
  const [appVersion, setAppVersion] = useState("");

  useEffect(() => {
    window.electron.getAppVersion().then(setAppVersion);
  }, []);

  return (
    <>
      <article className="markdown-body">
        <h1>OVE Client - v{appVersion}</h1>
      </article>
    </>
  );
}

export default App;
