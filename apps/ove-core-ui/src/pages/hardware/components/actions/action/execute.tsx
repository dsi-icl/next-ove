import { FileEarmarkCode } from "react-bootstrap-icons";
import React from "react";
import { useStore } from "../../../../../store";

const Execute = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "execute",
    deviceId: deviceId,
    pending: false
  })} title="execute">
    <FileEarmarkCode />
  </button>;
};

export default Execute;
