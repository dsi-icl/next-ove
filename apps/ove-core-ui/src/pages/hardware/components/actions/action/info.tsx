import React from "react";
import { useStore } from "../../../../../store";
import { type ActionProps } from "../../../types";
import { InfoCircle } from "react-bootstrap-icons";

const Info = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "info",
    deviceId,
    tag,
    pending: false
  })} title="info">
    <InfoCircle />
  </button>;
};

export default Info;
