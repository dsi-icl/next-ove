import { useEffect, useState } from "react";
import { Json } from "@ove/ove-utils";
import { type Device, is, OVEExceptionSchema } from "@ove/ove-types";
import { trpc } from "../../../utils/api";
// import { useFetchConfig } from "../../../hooks";

export type HardwareInfo = {
  device: Device
  status: "running" | "off" | null
  info: object | null
}

export const useHardware = (isOnline: boolean, bridgeId: string) => {
  // const fetchConfig = useFetchConfig();
  const [hardware, setHardware] = useState<HardwareInfo[]>([]);
  const getHardware = trpc.bridge.getDevices.useQuery({bridgeId});

  useEffect(() => {
    if (!isOnline) return;
    if (getHardware.status !== "success") return;
    if (is(OVEExceptionSchema, getHardware.data.response)) return;
    setHardware(getHardware.data.response.map(device => ({
      device,
      status: null,
      info: null
    })))
  }, [getHardware.status]);

  const updateHardware = <Key extends keyof HardwareInfo>(deviceId: string, [k, v]: [Key, HardwareInfo[Key]]) => {
    setHardware(cur => {
      const idx = cur.findIndex(({ device: { id } }) => id === deviceId);
      const copy = Json.copy(cur);
      copy[idx] = { ...copy[idx], [k]: v };
      return copy;
    });
  };

  return { hardware, updateHardware };
};