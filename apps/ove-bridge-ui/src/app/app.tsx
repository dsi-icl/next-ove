import { useNavigate } from "react-router-dom";
import Nav from "./nav";
import Router from "./router";
// IGNORE PATH - dependency removed at runtime
import {
  type InboundAPI,
  type OutboundAPI,
  type OutboundAPIChannels
} from "../../../ove-bridge/src/ipc-routes";
import { useEffect } from "react";

declare global {
  // noinspection JSUnusedGlobalSymbols
  interface Window {
    electron: InboundAPI & {
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
  const navigate = useNavigate();
  useEffect(() => {
    window.electron.receive<"openVideoStream">("open-video-stream", streamURL => {
      navigate("/live-view", {state: { streamURL }});
    });
  }, []);

  return <>
    <Nav />
    <Router />
  </>;
};

export default App;
