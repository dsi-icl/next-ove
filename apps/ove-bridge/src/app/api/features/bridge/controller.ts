import { env } from "../../../../env";
import { service } from "./service";
import { type TBridgeController } from "@ove/ove-types";
import { assert, raise } from "@ove/ove-utils";

const wrap = <T>(x: T) => ({meta: {bridge: assert(env.BRIDGE_NAME)}, response: x});

export const controller: TBridgeController = {
  getDevice: (args) => {
    const res = service.getDevice(args);
    if (res === undefined) return wrap(raise(`No device with id: ${args.deviceId}`));
    return wrap(res);
  },
  getDevices: args => wrap(service.getDevices(args)),
  addDevice: args => wrap(service.addDevice(args)),
  removeDevice: args => wrap(service.removeDevice(args)),
  startStreams: args => wrap(service.startStreams(args)),
  stopStreams: args => wrap(service.stopStreams(args)),
  getStreams: args => wrap(service.getStreams(args))
};