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
  ServiceType
} from "@ove/ove-types";
import { z } from "zod";
import { raise, assert } from "@ove/ove-utils";
import NodeService from "./node-service";
import PJLinkService from "./pjlink-service";
import MDCService from "./mdc-service";
import { env, saveEnv } from "@ove/ove-bridge-env";

export const wrapCallback = <Key extends keyof BridgeAPIType>(
  cb: (response: z.infer<BridgeAPIType[Key]["bridge"]>) => void
) => {
  return (response: z.infer<BridgeAPIType[Key]["client"]>) =>
    cb({
      bridgeResponse: response,
      meta: { bridge: assert(env.BRIDGE_NAME) }
    });
};

export const getDevices = async ({ tag }: BridgeServiceArgs<"getDevices">) => {
  const devices = env.HARDWARE.filter(({ tags }) => tag === undefined || tags.includes(tag));

  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    return raise(`No devices found${tagStatus}`);
  }

  return devices;
};

export const getDevice = async ({ deviceId }: BridgeServiceArgs<"getDevice">) => {
  const device = env.HARDWARE.find(({ id }) => deviceId === id);

  if (device === undefined) {
    return raise(`No device found with id: ${deviceId}`);
  }

  return device;
};

export const addDevice = async ({ device }: BridgeServiceArgs<"addDevice">) => {
  env.HARDWARE.push(device);
  saveEnv(env);
  return true;
};

export const removeDevice = async ({
  deviceId
}: BridgeServiceArgs<"removeDevice">) => {
  env.HARDWARE = env.HARDWARE.filter(({ id }) => id === deviceId);
  saveEnv(env);
  return true;
};

const filterUndefinedResponse = <T>(obj: {
  deviceId: string;
  response: T | undefined;
}): obj is { deviceId: string; response: T } => obj.response !== undefined;

const getServiceForProtocol = (protocol: ServiceType): DeviceService => {
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
    return await assert(service[k])(device, args);
  } else return undefined;
};

const without = <T extends object, U extends object>(object: T) => <K extends keyof T>(...parts: Array<K>): U => {
  return (Object.keys(object) as Array<keyof T>).reduce((acc, key) => {
    if (!parts.includes(key as any)) {
      acc[key] = object[key];
    }
    return acc;
  }, {} as T) as unknown as U;
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

  const serviceArgs: DeviceServiceArgs<Key> = without<typeof args, DeviceServiceArgs<Key>>(args)("deviceId");
  const response = await applyService<typeof k>(
    getServiceForProtocol(device.type),
    k,
    serviceArgs as DeviceServiceArgs<Key>,
    device
  );

  if (response === undefined) {
    callback({ response: raise("Command not available on device") });
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
        getServiceForProtocol(device.type),
        k,
        args as DeviceServiceArgs<Key>,
        device
      )
    )
  );

  if (isAll(z.undefined(), result)) {
    callback({ response: raise("Command not available on devices") });
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
    wrapCallback<"getDevice">(callback)(await getDevice(args)),
  getDevices: async (args, callback) =>
    wrapCallback<"getDevices">(callback)(await getDevices(args)),
  addDevice: async (args, callback) =>
    wrapCallback<"addDevice">(callback)(await addDevice(args)),
  removeDevice: async (args, callback) =>
    wrapCallback<"removeDevice">(callback)(await removeDevice(args))
};
