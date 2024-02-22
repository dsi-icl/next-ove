import { trpc } from "../../utils/api";
import { Json } from "@ove/ove-utils";
import { useEffect, useState } from "react";
import { is, OVEExceptionSchema } from "@ove/ove-types";
import { type DeviceStatus, type HardwareInfo } from "./types";

export const useHardware = (isOnline: boolean, bridgeId: string) => {
  const [hardware, setHardware] = useState<HardwareInfo[]>([]);
  const getHardware = trpc.bridge.getDevices
    .useQuery({ bridgeId }, { enabled: isOnline });

  useEffect(() => {
    if (!isOnline) return;
    if (getHardware.status !== "success") return;
    if (is(OVEExceptionSchema, getHardware.data.response)) return;
    setHardware(getHardware.data.response.map(device => ({
      device,
      status: null
    })));
  }, [getHardware.status, getHardware.data?.response, isOnline]);

  const updateStatus = (deviceId: string, status: "off" | "running" | null) => {
    setHardware(cur => {
      const idx = cur.findIndex(({ device: { id } }) => id === deviceId);
      const copy = Json.copy(cur);
      copy[idx] = { ...copy[idx], status };
      return copy;
    });
  };

  const updateStatusAll = (tag: string, status: DeviceStatus | {
    deviceId: string,
    status: DeviceStatus
  }[]) => {
    setHardware(cur => {
      if (status !== null && typeof status === "object") {
        const copy = Json.copy(cur);

        status.forEach(({ deviceId, status }) => {
          const idx = cur.findIndex(({ device: { id } }) => id === deviceId);

          if (tag === "" || copy[idx].device.tags.includes(tag)) {
            copy[idx] = { ...copy[idx], status };
          }
        });

        return copy;
      } else {
        return cur.map(({ device }) => ({ device, status }));
      }
    });
  };

  return { hardware, updateStatus, updateStatusAll };
};
