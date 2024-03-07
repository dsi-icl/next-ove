import { Camera } from "react-bootstrap-icons";
import React from "react";
import { useStore } from "../../../../../store";

const Screenshot = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "screenshot",
    deviceId: deviceId,
    pending: true
  })} title="screenshot">
    <Camera />
  </button>;
};

export default Screenshot;
