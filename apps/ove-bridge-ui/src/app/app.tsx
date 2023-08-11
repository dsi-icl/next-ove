import Nav from "./nav";
import Router from "./router";
import {
  InboundAPI,
  OutboundAPI,
  OutboundAPIChannels
} from "@ove/ove-bridge-shared";

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
 * OVE Bridge App
 * @constructor
 */
const App = () => <>
  <Nav />
  <Router />
</>;

export default App;
