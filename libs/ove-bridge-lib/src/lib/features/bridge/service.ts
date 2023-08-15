import { env } from "@ove/ove-bridge-env";
import { TBridgeService } from "@ove/ove-types";

export const service: TBridgeService = {
  getDevice: ({deviceId}) => env.HARDWARE.find(({id}) => id === deviceId),
  getDevices: ({tag}) => tag === undefined ? env.HARDWARE : env.HARDWARE.filter(({tags}) => tags.includes(tag)),
  addDevice: ({device}) => {
    env.HARDWARE.push(device);
    return true;
  },
  removeDevice: ({deviceId}) => {
    env.HARDWARE = env.HARDWARE.filter(({id}) => id !== deviceId);
    return true;
  }
};