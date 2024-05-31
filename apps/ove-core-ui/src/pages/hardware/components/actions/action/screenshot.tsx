import React from "react";
import { Camera } from "react-bootstrap-icons";
import { useStore } from "../../../../../store";
import type { ActionProps } from "../../../types";

const Screenshot = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "screenshot",
    deviceId,
    tag,
    pending: true
  })} title="screenshot">
    <Camera />
  </button>;
};

export default Screenshot;
