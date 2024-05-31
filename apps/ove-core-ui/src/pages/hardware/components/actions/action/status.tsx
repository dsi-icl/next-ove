import React from "react";
import { trpc } from "../../../../../utils/api";
import type { ActionProps } from "../../../types";
import { ArrowRepeat } from "react-bootstrap-icons";

const useStatus = (
  bridgeId: string,
  deviceId: string | null,
  tag: string | undefined
) => {
  const getStatus = trpc.hardware.getStatus.useQuery({
    bridgeId,
    deviceId: deviceId ?? ""
  }, { enabled: false });
  const getStatusAll = trpc.hardware.getStatusAll.useQuery(
    { bridgeId, tag }, { enabled: false });

  return {
    status: deviceId === null ?
      void getStatusAll.refetch : void getStatus.refetch
  };
};

const Status = ({ bridgeId, deviceId, tag }: ActionProps) => {
  const { status } = useStatus(bridgeId, deviceId, tag);
  return <button onClick={status} title="status">
    <ArrowRepeat />
  </button>;
};

export default Status;
