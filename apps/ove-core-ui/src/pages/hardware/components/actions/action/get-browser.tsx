import { useStore } from "../../../../../store";
import { Window } from "react-bootstrap-icons";
import React from "react";

const GetBrowser = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  return <button onClick={() => setDeviceAction({
    bridgeId,
    action: "browser",
    deviceId: deviceId,
    pending: true
  })} title="window status">
    <Window />
  </button>;
};

export default GetBrowser;
