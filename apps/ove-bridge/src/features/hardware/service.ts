import type {
  Device,
  SafeCallback,
  TBridgeHardwareService,
  TBridgeRoutesSchema,
  TBridgeServiceArgs,
  TClientRoutesSchema,
  Traceable,
} from "@ove/ove-types";
import { z } from "zod";
import { env, logger } from "../../env";
import { assert, filterFulfilled } from "@ove/ove-utils";
import { getServiceForProtocol } from "./utils";
import { controller } from "../reconciliation/controller";
import { injectTrace, traceSocketListener } from "../../utils/tracing";

export const getDevices = async (filterTags?: string[], ids?: string[]) => {
  const devices = env.HARDWARE.DEVICES.filter(
    ({ tags, id }) =>
      (filterTags === undefined && ids === undefined) ||
      (ids !== undefined && ids.includes(id)) ||
      (filterTags !== undefined && tags.some((t) => filterTags.includes(t))),
  );

  if (devices.length === 0) {
    const tagStatus =
      filterTags !== undefined ? ` with tags: ${filterTags.join(", ")}` : "";
    throw new Error(`No devices found${tagStatus}`);
  }

  return devices;
};

export const getDevice = async (deviceId: string) => {
  const device = env.HARDWARE.DEVICES.find(({ id }) => deviceId === id);
  if (device === undefined) {
    throw new Error(`No device found with id: ${deviceId}`);
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
  device: Device,
): Promise<z.infer<TClientRoutesSchema[Key]["returns"]> | undefined> => {
  if (
    (Object.keys(service) as Array<keyof TBridgeHardwareService>).includes(k)
  ) {
    const res = await assert(service[k])(device, args);
    try {
      controller.update(device.id, k, args);
    } catch (_e) {
      logger.error("Unable to update reconciliation state");
    }
    return res;
  } else return undefined;
};

const without =
  <T extends object, U extends object>(object: T) =>
  <K extends keyof T>(...parts: Array<K>): U => {
    return (Object.keys(object) as Array<keyof T>).reduce((acc, key) => {
      if (!parts.includes(key as K)) {
        acc[key] = object[key];
      }
      return acc;
    }, {} as T) as unknown as U;
  };

export const deviceHandler = async <Key extends keyof TBridgeHardwareService>(
  k: Key,
  args: Traceable<z.infer<TBridgeRoutesSchema[Key]["args"]>>,
  callback: (
    response: Traceable<
      SafeCallback<z.infer<TBridgeRoutesSchema[Key]["returns"]>>
    >,
  ) => void,
) => {
  const otel =
    typeof args === "object" && args?.__otel ? args.__otel : undefined;

  traceSocketListener(k, otel, async () => {
    try {
      logger.trace(`Handling: ${k}`);
      const device = await getDevice(args.deviceId);

      const serviceArgs: TBridgeServiceArgs<Key> = without<
        typeof args,
        TBridgeServiceArgs<Key>
      >(args)("deviceId", "__otel");
      let response: Awaited<ReturnType<typeof applyService<typeof k>>>;

      response = await applyService<typeof k>(
        getServiceForProtocol(device.type),
        k,
        serviceArgs,
        device,
      );
      if (response === undefined) {
        callback({
          status: "error",
          error: "Command not available on device",
          __otel: injectTrace(),
        });
        return;
      }

      callback({ status: "success", data: response, __otel: injectTrace() });
    } catch (e) {
      logger.error(e);
      callback({
        status: "error",
        error: (e as Error).message,
        __otel: injectTrace(),
      });
    }
  });
};

export const multiDeviceHandler = async <
  Key extends keyof TBridgeHardwareService,
>(
  k: Key,
  args: Traceable<z.infer<TBridgeRoutesSchema[`${Key}All`]["args"]>>,
  callback: (
    response: Traceable<SafeCallback<
      z.infer<TBridgeRoutesSchema[`${Key}All`]["returns"]>
    >>,
  ) => void,
) => {
  const otel =
    typeof args === "object" && args?.__otel ? args.__otel : undefined;

  traceSocketListener(k, otel, async () => {
    try {
      logger.trace(`Handling: ${k}All`);
      const devices = await getDevices(args.tags, args.deviceIds);

      delete args["tags"];
      delete args["deviceIds"];
      delete args["__otel"];
      let results: PromiseSettledResult<
        Awaited<TClientRoutesSchema[Key]["returns"]["_output"] | undefined>
      >[] = await Promise.allSettled(
        devices.map((device) =>
          applyService<Key>(
            getServiceForProtocol(device.type),
            k,
            args as TBridgeServiceArgs<Key>,
            device,
          ),
        ),
      );

      const response = results
        .map((x, i) => ({
          deviceId: devices[i].id,
          response: filterFulfilled(x)
            ? { status: "success" as const, data: x.value }
            : { status: "error" as const, error: (x.reason as Error).message ?? String(x.reason) },
        }))
        .filter(filterUndefinedResponse);

      callback({ status: "success", data: response, __otel: injectTrace() });
    } catch (e) {
      callback({ status: "error", error: (e as Error).message, __otel: injectTrace() });
    }
  });
};
