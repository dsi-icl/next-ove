import Console from "../console/console";
import { useStore } from "../../../../store";
import LiveView from "../live-view/live-view";
import InfoContainer from "../info/info-container";
import ScreenshotInput from "../screenshot/screenshot-input";
import ScreenshotDisplay from "../screenshot/screenshot-display";

const Popups = ({ isOpen }: {isOpen: boolean}) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  if (deviceAction.action === null || deviceAction.bridgeId === null) return <></>;
  else if (deviceAction.action === "monitoring") return <LiveView
    bridgeId={deviceAction.bridgeId} />;
  else if (deviceAction.action === "calendar") return <div>Calendar</div>;
  else if (deviceAction.action === "info") return <InfoContainer />;
  else if (deviceAction.action === "execute") return <Console isOpen={isOpen}
                                                              consoleId={deviceAction.deviceId ?? deviceAction.bridgeId} />;
  else if (deviceAction.action === "screenshot") return deviceAction.pending ?
    <ScreenshotInput /> : <ScreenshotDisplay />;
  else return <div>ERROR</div>;
};

export default Popups;
