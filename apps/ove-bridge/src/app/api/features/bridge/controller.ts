import { env } from "../../../../env";
import { service } from "./service";
import { type TBridgeController } from "@ove/ove-types";
import { assert, raise } from "@ove/ove-utils";

export const controller: TBridgeController = {
  getDevice: (args) => {
    const res = service.getDevice(args);

    if (res === undefined) return {
      meta: { bridge: assert(env.BRIDGE_NAME) },
      response: raise(`No device with id: ${args.deviceId}`)
    };

    return {
      meta: { bridge: assert(env.BRIDGE_NAME) },
      response: res
    };
  },
  getDevices: (args) => {
    const res = service.getDevices(args);

    return {
      meta: { bridge: assert(env.BRIDGE_NAME) },
      response: res
    };
  },
  addDevice: (args) => {
    const res = service.addDevice(args);
    return {
      meta: { bridge: assert(env.BRIDGE_NAME) },
      response: res
    };
  },
  removeDevice: args => {
    const res = service.removeDevice(args);
    return {
      meta: { bridge: assert(env.BRIDGE_NAME) },
      response: res
    };
  },
  loadVideoStream: args => {
    const res = service.loadVideoStream(args);
    return {
      meta: { bridge: assert(env.BRIDGE_NAME) },
      response: res
    };
  }
};