import React from "react";
import { useStore } from "../../../../../store";
import { VolumeDown } from "react-bootstrap-icons";

const Volume = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "volume",
    deviceId,
    pending: true
  })} title="set volume">
    <VolumeDown />
  </button>;
};

export default Volume;
