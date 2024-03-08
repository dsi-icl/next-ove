import React from "react";
import { useStore } from "../../../../../store";
import { type ActionProps } from "../../../types";
import { FileEarmarkCode } from "react-bootstrap-icons";

const Execute = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "execute",
    deviceId,
    tag,
    pending: false
  })} title="execute">
    <FileEarmarkCode />
  </button>;
};

export default Execute;
