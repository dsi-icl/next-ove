import { env, logger } from "../../../../env";
import { type TBridgeService } from "@ove/ove-types";

export const service: TBridgeService = {
  getDevice: ({ deviceId }) => env.HARDWARE.find(({ id }) => id === deviceId),
  getDevices: ({ tag }) => tag === undefined ? env.HARDWARE : env.HARDWARE.filter(({ tags }) => tags.includes(tag)),
  addDevice: ({ device }) => {
    env.HARDWARE.push(device);
    return true;
  },
  removeDevice: ({ deviceId }) => {
    env.HARDWARE = env.HARDWARE.filter(({ id }) => id !== deviceId);
    return true;
  },
  loadVideoStream: (args, listeners) => {
    listeners?.forEach(listener => {
      listener(args);
    });
    logger.info(args.streamURL);
    return true;
  }
};