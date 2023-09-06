import { useEffect, useRef, useState } from "react";
import { type Client, createClient } from "../../../utils";
import { useAuth } from "../../../hooks";
import { Json } from "@ove/ove-utils";
import { type Device, is, OVEExceptionSchema } from "@ove/ove-types";

export const useObservatories = () => {
  const { tokens } = useAuth();
  const [observatories, setObservatories] = useState<{
    name: string,
    isOnline: boolean
  }[] | null>(null);

  useEffect(() => {
    const client = createClient(tokens!);
    client.core.getObservatories.query().then(res => {
      if (is(OVEExceptionSchema, res)) {
        console.error(res.oveError);
      } else {
        setObservatories(res);
      }
    }).catch(console.error);
  }, []);

  return { observatories };
};

export const useClient = () => {
  const { tokens, loggedIn } = useAuth();
  const client = useRef(createClient(tokens!));

  if (!loggedIn) throw new Error("Unable to create unauthorised client");
  return client.current;
};

export type HardwareInfo = {
  device: Device
  status: "running" | "off" | null
  info: object | null
}

export const useHardware = (client: Client, isOnline: boolean, bridgeId: string) => {
  const [hardware, setHardware] = useState<HardwareInfo[]>([]);

  useEffect(() => {
    if (!isOnline) return;
    client.bridge.getDevices.query({ bridgeId }).then(result => {
      if (!result || is(OVEExceptionSchema, result.response)) {
        return;
      }
      setHardware(result.response.map(device => ({
        device,
        status: null,
        info: null
      })));
    }).catch(console.error);
  });

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