import { trpc } from "../../utils/api";
import { useStore } from "../../store";
import { assert } from "@ove/ove-utils";
import { InfoTypes } from "../../utils";
import { useMemo, useState } from "react";
import { skipMulti, skipSingle } from "./utils";
import { type DeviceStatus } from "./types";
import { is, isError, OVEExceptionSchema } from "@ove/ove-types";

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

  const hardware = useMemo(() => {
    if (!isOnline || getHardware.status !== "success" ||
      is(OVEExceptionSchema, getHardware.data.response)) return [];
    const formatStatus = (status: boolean | null): DeviceStatus => {
      if (status === null) return "offline";
      return status ? "running" : "off";
    };

    const getSingleStatus = (deviceId: string) => {
      if (deviceAction.deviceId !== deviceId) return null;
      return getStatus.status === "success" &&
      !isError(getStatus.data.response) ? getStatus.data.response : null;
    };

    const getMultiStatus = (deviceId: string) => {
      if (getStatusAll.status !== "success" ||
        "oveError" in getStatusAll.data.response) return null;
      const response = assert(getStatusAll.data.response
        .find(({ deviceId: id }) => id === deviceId)).response;
      return !isError(response) ? response : null;
    };

    return getHardware.data.response.map(device => {
      const status = !skipSingle("status", bridgeId, deviceAction) ?
        getSingleStatus(device.id) : getMultiStatus(device.id);
      return ({
        device,
        status: formatStatus(status)
      });
    });
  }, [isOnline, bridgeId, deviceAction, getHardware,
    getStatus, getStatusAll]);

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
