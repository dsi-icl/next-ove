import { GpuCard } from "react-bootstrap-icons";
import React from "react";
import { useStore } from "../../../../../store";
import { ActionProps } from "../../../types";

const Input = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "input_change",
    deviceId,
    tag,
    pending: true
  })} title="video input">
    <GpuCard />
  </button>;
};

export default Input;
