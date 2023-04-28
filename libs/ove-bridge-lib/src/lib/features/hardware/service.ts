import {
  BridgeAPIType,
  BridgeService,
  BridgeServiceArgs,
  Device,
  DeviceService,
  DeviceServiceArgs,
  is,
  isAll,
  Optional,
  OVEExceptionSchema,
  ServiceTypes
} from "@ove/ove-types";
import { z } from "zod";
import { env } from "../../environments/setup";
import * as Utils from "../../utils/utils";
import { Utils as OVEUtils } from "@ove/ove-utils";
import NodeService from "./node-service";
import PJLinkService from "./pjlink-service";
import MDCService from "./mdc-service";

const wrapCallback = <Key extends keyof BridgeAPIType>(
  cb: (response: z.infer<BridgeAPIType[Key]["bridge"]>) => void
) => {
  return (response: z.infer<BridgeAPIType[Key]["client"]>) =>
    cb({
      bridgeResponse: response,
      meta: { bridge: env.BRIDGE_NAME }
    });
};

const getDevices = async ({ tag }: BridgeServiceArgs<"getDevices">) => {
  const devices = Utils
    .getDevices()
    .filter(({ tags }) => tag === undefined || tags.includes(tag));

  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    return OVEUtils.raise(`No devices found${tagStatus}`);
  }

  return devices;
};

const getDevice = async ({ deviceId }: BridgeServiceArgs<"getDevice">) => {
  const device = Utils.getDevices().find(({ id }) => deviceId === id);

  if (device === undefined) {
    return OVEUtils.raise(`No device found with id: ${deviceId}`);
  }

  return device;
};

const addDevice = async ({ device }: BridgeServiceArgs<"addDevice">) => {
  const curDevices = Utils.getDevices();
  const devices = { ...curDevices, device };
  Utils.saveDevices(devices);
  return true;
};

const removeDevice = async ({
  deviceId
}: BridgeServiceArgs<"removeDevice">) => {
  const devices = Utils.getDevices().filter(({ id }) => id === deviceId);
  Utils.saveDevices(devices);
  return true;
};

const filterUndefinedResponse = <T>(obj: {
  deviceId: string;
  response: T | undefined;
}): obj is { deviceId: string; response: T } => obj.response !== undefined;

const getServiceForProtocol = (protocol: ServiceTypes) => {
  switch (protocol) {
    case "node":
      return NodeService;
    case "pjlink":
      return PJLinkService;
    case "mdc":
      return MDCService;
  }
};

const applyService = async <Key extends keyof DeviceService>(
  service: DeviceService,
  k: Key,
  args: DeviceServiceArgs<Key>,
  device: Device
): Promise<Optional<z.infer<BridgeAPIType[Key]["client"]>>> => {
  if ((Object.keys(service) as Array<keyof DeviceService>).includes(k)) {
    return await service[k](device, args);
  } else return undefined;
};

export const deviceHandler = async <Key extends keyof DeviceService>(
  k: Key,
  args: z.infer<BridgeAPIType[Key]["args"]>,
  cb: (response: z.infer<BridgeAPIType[Key]["bridge"]>) => void
) => {
  const callback = wrapCallback(cb);
  const device = await getDevice(args);

  if (is(OVEExceptionSchema, device)) {
    callback({ response: device });
    return;
  }

  delete args["deviceId"];
  const response = await applyService<typeof k>(
    getServiceForProtocol(device.protocol),
    k,
    args as DeviceServiceArgs<Key>,
    device
  );

  if (response === undefined) {
    callback({ response: OVEUtils.raise("Command not available on device") });
    return;
  }

  callback(response);
};

export const multiDeviceHandler = async <Key extends keyof DeviceService>(
  k: Key,
  args: z.infer<BridgeAPIType[`${Key}All`]["args"]>,
  cb: (response: z.infer<BridgeAPIType[`${Key}All`]["bridge"]>) => void
) => {
  const callback = wrapCallback(cb);
  const devices = await getDevices(args);

  if (is(OVEExceptionSchema, devices)) {
    callback({ response: devices });
    return;
  }

  delete args["tag"];
  const result = await Promise.all(
    devices.map(device =>
      applyService<Key>(
        getServiceForProtocol(device.protocol),
        k,
        args as DeviceServiceArgs<Key>,
        device
      )
    )
  );

  if (isAll(z.undefined(), result)) {
    callback({ response: OVEUtils.raise("Command not available on devices") });
    return;
  }

  const response = result
    .map((x, i) => ({
      deviceId: devices[i].id,
      response: x
    }))
    .filter(filterUndefinedResponse);

  callback(response);
};

export const Service: BridgeService = {
  getDevice: async (args, callback) =>
    wrapCallback(callback)({ response: await getDevice(args) }),
  getDevices: async (args, callback) =>
    wrapCallback(callback)({ response: await getDevices(args) }),
  addDevice: async (args, callback) =>
    wrapCallback(callback)({ response: await addDevice(args) }),
  removeDevice: async (args, callback) =>
    wrapCallback(callback)({ response: await removeDevice(args) })
};
