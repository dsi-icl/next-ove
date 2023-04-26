/* global console */

import {
  ClientToServerEvents,
  BridgeAPI,
  ClientAPIRoutes,
  Device,
  is,
  OVEExceptionSchema,
  isAll,
  ServiceTypes,
  BridgeAPIRoutesType, DS, DSArgs, ClientAPIRoutesType, Optional
} from "@ove/ove-types";
import { env } from "@ove/ove-bridge";
import { io, Socket } from "socket.io-client";
import { Utils as OVEUtils } from "@ove/ove-utils";
import { z } from "zod";
import NodeService from "./node-service";
import PJLinkService from "./pjlink-service";
import MDCService from "./mdc-service";
import * as Utils from "../../utils/utils";

const wrapCallback = <Key extends keyof BridgeAPIRoutesType>(cb: (response: z.infer<BridgeAPIRoutesType[Key]["bridge"]>) => void) => {
  return (response: z.infer<BridgeAPIRoutesType[Key]["client"]>) => cb({
    response,
    meta: { bridge: env.BRIDGE_NAME }
  });
};

export const getDevices = (tag?: string) => {
  const devices = Utils
    .getDevices()
    .filter(device =>
      tag === undefined || device.tags.includes(tag));

  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    return OVEUtils.raise(`No devices found${tagStatus}`);
  }

  return devices;
};

export const getDevice = (did: string) => {
  const device = Utils
    .getDevices()
    .find(({ id }) => did === id);

  if (device === undefined) {
    return OVEUtils.raise(`No device found with id: ${did}`);
  }

  return device;
};

export const addDevice = async (device: Device) => {
  const curDevices = Utils.getDevices();
  const devices = { ...curDevices, device };
  Utils.saveDevices(devices);
  return true;
};

export const removeDevice = async (deviceId: string) => {
  const devices = Utils.getDevices().filter(({ id }) => id === deviceId);
  Utils.saveDevices(devices);
  return true;
};

const filterUndefinedResponse = <T>(
  obj: { deviceId: string, response: T | undefined }
): obj is { deviceId: string, response: T } => obj.response !== undefined;

const getServiceForProtocol = (protocol: ServiceTypes) => {
  console.log(protocol);
  console.log(JSON.stringify(Object.keys(NodeService)));
  switch (protocol) {
    case "node":
      return NodeService;
    case "pjlink":
      return PJLinkService;
    case "mdc":
      return MDCService;
  }
};

const applyService = async <Key extends keyof ClientAPIRoutesType>(service: DS, k: Key, args: DSArgs<Key>, device: Device): Promise<Optional<z.infer<BridgeAPIRoutesType[Key]["client"]>>> => {
  console.log(Object.keys(service) as Array<keyof DS>);
  console.log(k);
  console.log((Object.keys(service) as Array<keyof DS>).includes(k));
  if ((Object.keys(service) as Array<keyof DS>).includes(k)) {
    console.log("Found k");
    const result = await service[k](device, args);
    console.log(result);
    return result;
  } else return undefined;
};

const deviceHandler = async <Key extends keyof ClientAPIRoutesType>(
  k: Key,
  args: z.infer<BridgeAPIRoutesType[Key]["args"]>,
  cb: (response: z.infer<BridgeAPIRoutesType[Key]["bridge"]>) => void
) => {
  const callback = wrapCallback(cb);
  const device = getDevice(args.deviceId);

  if (is(OVEExceptionSchema, device)) {
    callback({ response: device });
    return;
  }

  delete args["deviceId"];
  const response = await applyService<typeof k>(getServiceForProtocol(device.protocol), k, args as z.infer<ClientAPIRoutesType[Key]["args"]>, device);

  if (response === undefined) {
    callback({ response: OVEUtils.raise("Command not available on device") });
    return;
  }

  callback({ response });
};

const multiDeviceHandler = async <Key extends keyof ClientAPIRoutesType>(
  k: Key,
  args: z.infer<BridgeAPIRoutesType[`${Key}All`]["args"]>,
  cb: (response: z.infer<BridgeAPIRoutesType[`${Key}All`]["bridge"]>) => void
) => {
  const callback = wrapCallback(cb);
  const devices = getDevices(args.tag);

  if (is(OVEExceptionSchema, devices)) {
    callback({ response: devices });
    return;
  }

  delete args["tag"];
  const result = await Promise.all(devices.map(device => applyService<Key>(getServiceForProtocol(device.protocol), k, args as z.infer<ClientAPIRoutesType[Key]["args"]>, device)));

  if (isAll(z.undefined(), result)) {
    callback({ response: OVEUtils.raise("Command not available on devices") });
    return;
  }

  const response = result.map((x, i) => ({
    deviceId: devices[i].id,
    response: x
  })).filter(filterUndefinedResponse);

  callback({ response });
};

export default () => {
  console.log(`connecting to - ws://${env.CORE_URL}/hardware`);
  const socket: Socket<BridgeAPI, ClientToServerEvents> = io(`ws://${env.CORE_URL}/hardware`, { autoConnect: false });
  socket.auth = { "name": `${env.BRIDGE_NAME}` };
  socket.connect();
  console.log(`Testing: ${env.CORE_URL}`);

  socket.on("connect", () => {
    console.log("Connected");
    console.log(socket.id);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected");
    console.log(socket.id);
  });

  socket.on("getDevice", async ({ deviceId }, cb) => {
    wrapCallback(cb)({ response: getDevice(deviceId) });
  });

  socket.on("getDevices", async (args, cb) => {
    wrapCallback(cb)({ response: getDevices() });
  });

  socket.on("addDevice", async ({ device }, cb) => {
    wrapCallback(cb)({
      response: await addDevice(device),
      meta: { bridge: env.BRIDGE_NAME }
    });
  });

  socket.on("removeDevice", async ({ deviceId }, cb) => {
    wrapCallback(cb)({
      response: await removeDevice(deviceId),
      meta: { bridge: env.BRIDGE_NAME }
    });
  });

  (Object.keys(ClientAPIRoutes) as Array<keyof typeof ClientAPIRoutes>).forEach(k => {
    socket.on(k, (args, callback) => deviceHandler(k, args, callback));

    socket.on(`${k}All` as const, (args, callback) => multiDeviceHandler(k, args, callback));
  });

  socket.on("connect_error", err =>
    console.error(`connect_error due to ${err.message}`));
  console.log("Hardware component started!");
};
