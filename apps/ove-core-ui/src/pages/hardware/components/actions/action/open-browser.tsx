import { useStore } from "../../../../../store";
import { WindowPlus } from "react-bootstrap-icons";
import React from "react";

const OpenBrowser = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "browser_open",
    deviceId: deviceId,
    pending: true
  })} title="open window">
    <WindowPlus />
  </button>;
};

export default OpenBrowser;
