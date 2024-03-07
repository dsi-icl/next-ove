import { GpuCard } from "react-bootstrap-icons";
import React from "react";
import { useStore } from "../../../../../store";

const Input = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "input_change",
    deviceId: deviceId,
    pending: true
  })} title="video input">
    <GpuCard />
  </button>;
};

export default Input;
