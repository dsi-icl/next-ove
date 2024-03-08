import React from "react";
import { Window } from "react-bootstrap-icons";
import { useStore } from "../../../../../store";
import { ActionProps } from "../../../types";

const GetBrowser = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "browser",
    deviceId,
    tag,
    pending: true
  })} title="window status">
    <Window />
  </button>;
};

export default GetBrowser;
