import { trpc } from "../../utils/api";
import { assert } from "@ove/ove-utils";
import { useMemo } from "react";
import { is, isError, OVEExceptionSchema } from "@ove/ove-types";
import { useStore } from "../../store";
import { skipSingle } from "./utils";

export const useHardware = (isOnline: boolean, bridgeId: string) => {
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const getHardware = trpc.bridge.getDevices
    .useQuery({ bridgeId }, { enabled: isOnline });
  const getStatus = trpc.hardware.getStatus.useQuery({
    bridgeId,
    deviceId: deviceAction.deviceId ?? ""
  }, { enabled: false });
  const getStatusAll = trpc.hardware.getStatusAll.useQuery({
    bridgeId
  }, { enabled: true });

  const formatStatus = (status: boolean | null): "running" | "off" | null => {
    if (status === null) return null;
    return status ? "running" : "off";
  };

  const getSingleStatus = (deviceId: string) => {
    if (deviceAction.deviceId !== deviceId) return null;
    return getStatus.status === "success" && !isError(getStatus.data.response) ?
      getStatus.data.response : null;
  };

  const getMultiStatus = (deviceId: string) => {
    if (getStatusAll.status !== "success" ||
      "oveError" in getStatusAll.data.response) return null;
    const response = assert(getStatusAll.data.response
      .find(({ deviceId: id }) => id === deviceId)).response;
    return !isError(response) ? response : null;
  };

  const hardware = useMemo(() => {
    if (!isOnline || getHardware.status !== "success" ||
      is(OVEExceptionSchema, getHardware.data.response)) return [];
    return getHardware.data.response.map(device => {
      const status = !skipSingle("status", bridgeId, deviceAction) ?
        getSingleStatus(device.id) : getMultiStatus(device.id);
      return ({
        device,
        status: formatStatus(status)
      });
    });
  }, [isOnline, getHardware.status, getHardware.data?.response,
    getStatus.status, getStatus.data?.response, getStatusAll.status,
    getStatusAll.data?.response]);

  return {
    hardware,
    refetch: { single: getStatus.refetch, multi: getStatusAll.refetch }
  };
};
