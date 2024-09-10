import {
  type Device,
  type TBridgeHardwareService,
  type TBridgeServiceArgs,
  is,
  isAll,
  type Optional,
  OVEExceptionSchema,
  type TBridgeRoutesSchema
} from "@ove/ove-types";
import { z } from "zod";
import { env, logger } from "../../../../env";
import { service as ReconciliationService } from "./reconciliation-service";
import { raise, assert, Json } from "@ove/ove-utils";
import { getServiceForProtocol } from "./utils";

export const wrapCallback = <Key extends keyof TBridgeRoutesSchema>(
  cb: (response: z.infer<TBridgeRoutesSchema[Key]["bridge"]>) => void
) => {
  return (response: z.infer<TBridgeRoutesSchema[Key]["client"]>) =>
    cb({
      response: response,
      meta: { bridge: assert(env.BRIDGE_NAME) }
    });
};

export const getDevices = async (tag?: string) => {
  const devices =
    env.HARDWARE.filter(({ tags }) =>
      tag === undefined || tags.includes(tag));

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

const applyService = async <Key extends keyof TBridgeHardwareService>(
  service: TBridgeHardwareService,
  k: Key,
  args: TBridgeServiceArgs<Key>,
  device: Device
): Promise<Optional<z.infer<TBridgeRoutesSchema[Key]["client"]>>> => {
  if ((Object.keys(service) as Array<keyof TBridgeHardwareService>)
    .includes(k)) {
    const res = await assert(service[k])(device, args);
    await ReconciliationService.updateState(device, k, args);
    return res;
  } else return undefined;
};

const without = <T extends object, U extends object>(object: T) =>
  <K extends keyof T>(...parts: Array<K>): U => {
    return (Object.keys(object) as Array<keyof T>)
      .reduce((acc, key) => {
        if (!parts.includes(key as K)) {
          acc[key] = object[key];
        }
        return acc;
      }, {} as T) as unknown as U;
  };

export const deviceHandler = async <Key extends keyof TBridgeHardwareService>(
  k: Key,
  args: z.infer<TBridgeRoutesSchema[Key]["args"]>,
  cb: (response: z.infer<TBridgeRoutesSchema[Key]["bridge"]>) => void
) => {
  logger.info(`Handling: ${k}`);
  const callback = wrapCallback(cb);
  const device = await getDevice(args.deviceId);

  if (is(OVEExceptionSchema, device)) {
    callback(device);
    return;
  }

  const serviceArgs: TBridgeServiceArgs<Key> =
    without<typeof args, TBridgeServiceArgs<Key>>(args)("deviceId");
  let response: Awaited<ReturnType<typeof applyService<typeof k>>>;
  try {
    response = await applyService<typeof k>(
      getServiceForProtocol(device.type),
      k,
      serviceArgs,
      device
    );
  } catch (e) {
    logger.error(e);
    callback(raise(`Failed to handle ${k}`));
    return;
  }

  if (response === undefined) {
    callback(raise("Command not available on device"));
    return;
  }

  callback(response);
};

export const multiDeviceHandler =
  async <Key extends keyof TBridgeHardwareService>(
    k: Key,
    args: z.infer<TBridgeRoutesSchema[`${Key}All`]["args"]>,
    cb: (response: z.infer<TBridgeRoutesSchema[`${Key}All`]["bridge"]>) => void
  ) => {
    logger.info(`Handling: ${k}All`);
    const callback = wrapCallback(cb);
    const devices = await getDevices(args.tag);

    if (is(OVEExceptionSchema, devices)) {
      callback(devices);
      return;
    }

    delete args["tag"];
    let result:
      Awaited<TBridgeRoutesSchema[Key]["client"]["_output"] | undefined>[];

    try {
      result = await Promise.all(
        devices.map(device =>
          applyService<Key>(
            getServiceForProtocol(device.type),
            k,
            args as TBridgeServiceArgs<Key>,
            device
          )
        )
      );
    } catch (e) {
      logger.error(e);
      callback(raise(Json.stringify(e)));
      return;
    }

    if (isAll(z.undefined(), result)) {
      callback(raise("Command not available on devices"));
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
