import Nav from "./nav";
import Router from "./router";
// IGNORE PATH - dependency removed at runtime
import {
  type OutboundAPI,
  type OutboundAPIChannels
} from "../../../ove-bridge/src/ipc-routes";
import { type InboundAPI } from "@ove/ove-types";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    bridge: InboundAPI & {
      receive: <Key extends keyof OutboundAPI>(
        event: OutboundAPIChannels[Key],
        listener: (args: Parameters<OutboundAPI[Key]>[0]) =>
          ReturnType<OutboundAPI[Key]>
      ) => void
    };
  }
}

/**
 * OVE Bridge App
 * @constructor
 */
const App = () => {
  return <>
    <Nav />
    <Router />
  </>;
};

export default App;
