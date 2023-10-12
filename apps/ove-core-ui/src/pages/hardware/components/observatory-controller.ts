import { type DeviceInfo } from "./observatory";
import { type HardwareInfo } from "../hooks/hooks";
import { trpc } from "../../../utils/api";
import { useEffect } from "react";
import { isError } from "@ove/ove-types";
import { logger } from "../../../env";
import { Json } from "@ove/ove-utils";

export type UpdateHardware = <Key extends keyof HardwareInfo>(deviceId: string, [k, v]: [Key, HardwareInfo[Key]]) => void

export const useStatus = (deviceId: string, bridgeId: string, updateHardware: UpdateHardware) => {
  const status = trpc.hardware.getStatus.useQuery({ bridgeId, deviceId }, { enabled: false });

  useEffect(() => {
    if (status.status !== "success") return;
    updateHardware(deviceId, ["status", status.data.response && !isError(status.data.response) ? "running" : "off"]);
  }, [status.status, status.isRefetching]);

  return status.refetch;
};

export const useInfo = (deviceId: string, bridgeId: string, updateInfo: (deviceId: string, data: DeviceInfo) => void) => {
  const info = trpc.hardware.getInfo.useQuery({ bridgeId, deviceId }, { enabled: false, cacheTime: Infinity });

  useEffect(() => {
    if (info.status === "error") {
      logger.error(Json.stringify(info.data));
    }
    if (info.status !== "success") return;
    logger.info(Json.stringify(info.data));
    if (isError(info.data.response)) return;
    updateInfo(deviceId, { deviceId, data: info.data.response } as unknown as DeviceInfo);
  }, [info.status, info.isRefetching]);

  return info.refetch;
};

export const useStartDevice = (deviceId: string, showNotification: (text: string) => void) => {
  const start = trpc.hardware.start.useMutation();

  useEffect(() => {
    if (start.status === "error" || (start.status === "success" && isError(start.data.response))) {
      showNotification(`Failed to start: ${deviceId}`);
    } else if (start.status === "success") {
      showNotification(`Started ${deviceId}`);
    }
  }, [start.status]);

  return start.mutateAsync;
};

export const useShutdownDevice = (deviceId: string, showNotification: (text: string) => void) => {
  const shutdown = trpc.hardware.shutdown.useMutation();

  useEffect(() => {
    if (shutdown.status === "error" || (shutdown.status === "success" && isError(shutdown.data.response))) {
      showNotification(`Failed to stop ${deviceId}`);
    } else if (shutdown.status === "success") {
      showNotification(`Stopped ${deviceId}`);
    }
  }, [shutdown.status]);

  return shutdown.mutateAsync;
};