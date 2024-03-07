import { useStore } from "../../../../../store";
import { WindowDash } from "react-bootstrap-icons";
import React from "react";

const CloseBrowser = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    deviceId: deviceId,
    action: "browser_close",
    pending: true
  })} title="close window">
    <WindowDash />
  </button>;
};

export default CloseBrowser;
