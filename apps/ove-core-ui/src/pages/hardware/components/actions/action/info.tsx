import { InfoCircle } from "react-bootstrap-icons";
import React from "react";
import { useStore } from "../../../../../store";

const Info = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "info",
    deviceId: deviceId,
    pending: false
  })} title="info">
    <InfoCircle />
  </button>;
};

export default Info;
