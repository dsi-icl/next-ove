import React from "react";
import { useStore } from "../../../../../store";
import type { ActionProps } from "../../../types";
import { VolumeDown } from "react-bootstrap-icons";

const Volume = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "volume",
    deviceId,
    tag,
    pending: true
  })} title="set volume">
    <VolumeDown />
  </button>;
};

export default Volume;
