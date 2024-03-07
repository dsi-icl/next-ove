import React from "react";
import { trpc } from "../../../../../utils/api";
import { useStore } from "../../../../../store";
import { ArrowRepeat } from "react-bootstrap-icons";

const Status = ({ bridgeId, deviceId }: {
  bridgeId: string,
  deviceId: string | null
}) => {
  const setDeviceAction =
    useStore(state => state.hardwareConfig.setDeviceAction);
  const getStatus = trpc.hardware.getStatus.useQuery({
    bridgeId,
    deviceId: deviceId ?? ""
  }, { enabled: false });
  const getStatusAll = trpc.hardware.getStatusAll.useQuery(
    { bridgeId }, { enabled: false });
  return <button onClick={() => {
    setDeviceAction({
      bridgeId,
      action: "status",
      deviceId: null,
      pending: false
    });
    deviceId === null ? getStatusAll.refetch() : getStatus.refetch();
  }} title="status">
    <ArrowRepeat />
  </button>;
};

export default Status;
