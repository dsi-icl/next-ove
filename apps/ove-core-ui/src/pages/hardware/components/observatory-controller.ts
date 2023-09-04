import { createClient } from "../../../utils";
import { type DeviceInfo } from "./observatory";
import { logger } from "../../../env";
import { Json } from "@ove/ove-utils";
import { type HardwareInfo } from "../hooks/hooks";

export type UpdateHardware = <Key extends keyof HardwareInfo>(deviceId: string, [k, v]: [Key, HardwareInfo[Key]]) => void

const updateStatus = async (client: ReturnType<typeof createClient>, deviceId: string, bridgeId: string, updateHardware: UpdateHardware) => {
  const status = (await client.hardware.getStatus.query({
    bridgeId,
    deviceId
  }))["response"] ? "running" : "off";
  updateHardware(deviceId, ["status", status]);
};

// const flatten = (obj: object): object => {
//   return (Object.keys(obj) as Array<keyof typeof obj>).reduce((acc, k) => {
//     if (typeof obj[k] === "object") {
//       return {
//         ...acc,
//         ...flatten(obj[k])
//       };
//     } else {
//       acc[k] = obj[k];
//       return acc;
//     }
//   }, {});
// };

const updateInfo = async (client: ReturnType<typeof createClient>, deviceId: string, bridgeId: string, updateInfo: (deviceId: string, data: DeviceInfo) => void) => {
  const i = (await client.hardware.getInfo.query({
    bridgeId,
    deviceId
  }));
  logger.info(Json.stringify(i));
  updateInfo(deviceId, i as unknown as DeviceInfo);
};

const startDevice = async (client: ReturnType<typeof createClient>, deviceId: string, bridgeId: string, showNotification: (text: string) => void) => {
  try {
    await client.hardware.start.mutate({
      bridgeId,
      deviceId
    });
    showNotification(`Started ${deviceId}`);
  } catch (_e) {
    showNotification(`Failed to start ${deviceId}`);
  }
};

const stopDevice = async (client: ReturnType<typeof createClient>, deviceId: string, bridgeId: string, showNotification: (text: string) => void) => {
  try {
    await client.hardware.shutdown.mutate({
      bridgeId,
      deviceId
    });
    showNotification(`Stopped ${deviceId}`);
  } catch (_e) {
    showNotification(`Failed to stop ${deviceId}`);
  }
};

export default {
  updateStatus,
  updateInfo,
  startDevice,
  stopDevice
};