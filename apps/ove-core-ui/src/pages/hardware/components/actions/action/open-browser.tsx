import React from "react";
import { useStore } from "../../../../../store";
import { type ActionProps } from "../../../types";
import { WindowPlus } from "react-bootstrap-icons";

const OpenBrowser = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "browser_open",
    deviceId,
    tag,
    pending: true
  })} title="open window">
    <WindowPlus />
  </button>;
};

export default OpenBrowser;
