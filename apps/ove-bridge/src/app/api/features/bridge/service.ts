import { env, logger } from "../../../../env";
import { type TBridgeService } from "@ove/ove-types";
import { execSync } from "child_process";

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
  startStreams: () => {
    if (env.START_VIDEO_SCRIPT === undefined) return true;
    try {
      execSync(env.START_VIDEO_SCRIPT);
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  },
  stopStreams: () => {
    if (env.STOP_VIDEO_SCRIPT === undefined) return true;
    try {
      execSync(env.STOP_VIDEO_SCRIPT);
      return true;
    } catch (e) {
      logger.error(e);
      return false;
    }
  },
  getStreams: () => env.VIDEO_STREAMS
};