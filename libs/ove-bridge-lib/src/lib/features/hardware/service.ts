import {
  BridgeAPIType,
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
import { env } from "@ove/ove-bridge-env";

export const wrapCallback = <Key extends keyof BridgeAPIType>(
  cb: (response: z.infer<BridgeAPIType[Key]["bridge"]>) => void
) => {
  return (response: z.infer<BridgeAPIType[Key]["client"]>) =>
    cb({
      bridgeResponse: response,
      meta: { bridge: assert(env.BRIDGE_NAME) }
    });
};

export const getDevices = async (tag?: string) => {
  const devices = env.HARDWARE.filter(({ tags }) => tag === undefined || tags.includes(tag));

  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    return raise(`No devices found${tagStatus}`);
  }

  return devices;
};

export const getDevice = async (deviceId: string) => {
  const device = env.HARDWARE.find(({ id }) => deviceId === id);

  if (device === undefined) {
    return raise(`No device found with id: ${deviceId}`);
  }

  return device;
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
  const device = await getDevice(args.deviceId);

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
  const devices = await getDevices(args.tag);

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
