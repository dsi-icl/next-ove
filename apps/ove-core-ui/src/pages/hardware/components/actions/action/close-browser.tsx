import React from "react";
import { useStore } from "../../../../../store";
import { type ActionProps } from "../../../types";
import { WindowDash } from "react-bootstrap-icons";

const CloseBrowser = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    deviceId,
    tag,
    action: "browser_close",
    pending: true
  })} title="close window">
    <WindowDash />
  </button>;
};

export default CloseBrowser;
