import React from "react";
import Console from "../console/console";
import { useStore } from "../../../../store";
import LiveView from "../live-view/live-view";
import InfoContainer from "../info/info-container";
import BrowserStatus from "../browser-modals/browser-status";
import ScreenshotInput from "../screenshot/screenshot-input";
import ScreenshotDisplay from "../screenshot/screenshot-display";
import Volume from "../volume/volume";
import Calendar from "../calendar/calendar";
import PowerMode from "../power-mode/power-mode";

const Popups = ({ isOpen }: { isOpen: boolean }) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  if (deviceAction.bridgeId === null) return null;
  switch (deviceAction.action) {
    case null:
      return null;
    case "monitoring":
      return <LiveView bridgeId={deviceAction.bridgeId} isOpen={isOpen} />;
    case "calendar":
      return <Calendar />;
    case "power_mode":
      return <PowerMode />;
    case "info":
      return <InfoContainer />;
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
