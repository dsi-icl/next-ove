import Nav from "./nav";
import React from "react";
import Router from "./router";
// IGNORE PATH - dependency removed at runtime
// eslint-disable-next-line @nx/enforce-module-boundaries
import type {
  OutboundAPI,
  OutboundAPIChannels
} from "../../../ove-bridge/src/ipc-routes";
import type { InboundAPI } from "@ove/ove-types";
import { Toaster } from "@ove/ui-base-components";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    bridge: InboundAPI & {
      receive: <Key extends keyof OutboundAPI>(
        event: OutboundAPIChannels[Key],
        listener: (
          args: Parameters<OutboundAPI[Key]>[0]
        ) => ReturnType<OutboundAPI[Key]>
      ) => void;
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
  <Toaster />
</>;

export default App;
