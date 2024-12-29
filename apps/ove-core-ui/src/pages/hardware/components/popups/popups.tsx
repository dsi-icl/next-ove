import React from "react";
import Volume from "../volume/volume";
import Console from "../console/console";
import { useStore } from "../../../../store";
import BrowserStatus from "../browser-modals/browser-status";
import ScreenshotInput from "../screenshot/screenshot-input";
import ScreenshotDisplay from "../screenshot/screenshot-display";

const Popups = () => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  if (deviceAction.bridgeId === null) return null;
  switch (deviceAction.action) {
    case null:
      return null;
    case "execute":
      return <Console />;
    case "screenshot":
      return deviceAction.pending ?
        <ScreenshotInput /> : <ScreenshotDisplay />;
    case "browser":
      return <BrowserStatus />;
    case "input_change":
      return <div>Input Change</div>; // TODO - implement
    case "volume":
      return deviceAction.pending ? <Volume /> : null;
    default:
      return <div>ERROR</div>;
  }
};

export default Popups;
