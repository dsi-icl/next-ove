import "../styles.scss";
import styles from "./app.module.scss";
// IGNORE PATH - dependency removed at runtime
import {
  type InboundAPI,
  type OutboundAPI,
  type OutboundAPIChannels
} from "../../../ove-client/src/ipc-routes";
import { usePin } from "./app-controller";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    client: InboundAPI & {
      receive: <Key extends keyof OutboundAPI>(
        event: OutboundAPIChannels[Key],
        listener: (args: Parameters<OutboundAPI[Key]>[0]) =>
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
  const pin = usePin();

  return <main className={styles.main}>
    <h1 className={styles.pin}>{pin}</h1>
  </main>;
}

export default App;
