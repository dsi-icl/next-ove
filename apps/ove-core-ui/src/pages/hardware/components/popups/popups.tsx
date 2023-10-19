import Console from "../console/console";
import { useStore } from "../../../../store";
import LiveView from "../live-view/live-view";
import InfoContainer from "../info/info-container";
import BrowserInput from "../browser-modals/browser-input";
import BrowserStatus from "../browser-modals/browser-status";
import ScreenshotInput from "../screenshot/screenshot-input";
import BrowserIdInput from "../browser-modals/browser-id-input";
import ScreenshotDisplay from "../screenshot/screenshot-display";

const Popups = ({ isOpen }: {isOpen: boolean}) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  if (deviceAction.bridgeId === null) return <></>;
  switch (deviceAction.action) {
    case null: return <></>;
    case "monitoring": return <LiveView bridgeId={deviceAction.bridgeId} />;
    case "calendar": return <div>Calendar</div>; // TODO - implement
    case "power_mode": return <div>Power Mode</div>; // TODO - implement
    case "info": return <InfoContainer />;
    case "execute": return <Console isOpen={isOpen} consoleId={deviceAction.deviceId ?? deviceAction.bridgeId} />;
    case "screenshot": return deviceAction.pending ? <ScreenshotInput /> : <ScreenshotDisplay />;
    case "browser_status": return deviceAction.pending ? <BrowserIdInput /> : <BrowserStatus />;
    case "browser_open": return <BrowserInput />;
    case "browser_close": return <BrowserIdInput />;
    case "input_change": return <div>Input Change</div>; // TODO - implement
    default: return <div>ERROR</div>;
  }
};

export default Popups;
