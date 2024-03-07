import { trpc } from "../../utils/api";
import { assert } from "@ove/ove-utils";
import { useMemo, useState } from "react";
import { is, isError, OVEExceptionSchema } from "@ove/ove-types";
import { useStore } from "../../store";
import { skipMulti, skipSingle } from "./utils";
import { InfoTypes } from "../../utils";

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
  }, [isOnline, bridgeId, deviceAction, getSingleStatus, getMultiStatus]);

  return { hardware };
};

export const useInfo = () => {
  const [type, setType] = useState<InfoTypes | null>(null);
  const deviceAction = useStore(state => state.hardwareConfig.deviceAction);
  const getInfo = trpc.hardware.getInfo.useQuery({
    bridgeId: deviceAction.bridgeId ?? "",
    deviceId: deviceAction.deviceId ?? "",
    type: type ?? "general"
  }, {
    enabled: !skipSingle(
      "info", deviceAction.bridgeId ?? "", deviceAction)
  });
  const getInfoAll = trpc.hardware.getInfoAll.useQuery({
    bridgeId: deviceAction.bridgeId ?? "",
    type: type ?? "general"
  }, {
    enabled: !skipMulti(
      "info", deviceAction.bridgeId ?? "", deviceAction)
  });

  const info = useMemo(() => {
    const map: Map<number, {
      deviceId: string,
      response: object | null
    }> = new Map();
    if (skipSingle(
      "info", deviceAction.bridgeId ?? "", deviceAction)) {
      if (getInfoAll.status !== "success" ||
        "oveError" in getInfoAll.data.response) return map;
      getInfoAll.data.response.forEach(({ deviceId, response }, i) => {
        map.set(i, {
          deviceId,
          response: isError(response) ? null : response as object
        });
      });
      return map;
    } else {
      if (getInfo.status !== "success") return map;
      map.set(0, {
        deviceId: deviceAction.deviceId ?? "",
        response: isError(getInfo.data.response) ?
          null : getInfo.data.response as object
      });
      return map;
    }
  }, [deviceAction, getInfo.status, getInfo.data?.response,
    getInfoAll.status, getInfoAll.data?.response]);

  return {
    info,
    type,
    setType,
    refetch: {
      single: getInfo.refetch,
      multi: getInfoAll.refetch
    }
  };
};
