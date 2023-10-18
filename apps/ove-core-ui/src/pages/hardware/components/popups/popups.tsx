import Console from "../console/console";
import LiveView from "../live-view/live-view";
import { type DeviceAction } from "../../types";
import InfoContainer from "../info/info-container";

type PopupsProps = {
  name: string
  deviceAction: DeviceAction,
  isOpen: boolean
}

const Popups = ({
  name,
  deviceAction,
  isOpen
}: PopupsProps) => {
  if (deviceAction.action === null) return <></>;
  else if (deviceAction.action === "monitoring") return <LiveView
    bridgeId={name} />;
  else if (deviceAction.action === "calendar") return <div>Calendar</div>;
  else if (deviceAction.action === "info") return <InfoContainer
    deviceAction={deviceAction} />;
  else if (deviceAction.action === "execute") return <Console isOpen={isOpen}
                                                              consoleId={deviceAction.deviceId ?? name} />;
  else return <div>ERROR</div>;
};

export default Popups;
