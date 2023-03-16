import NodeService from "./node-service";
import MDCService from "./mdc-service";
import ProjectorService from "./projector-service";
import * as Utils from "../utils/utils";
import { Utils as OVEUtils } from "@ove/ove-utils";
import {
  Device,
  filterIsNot,
  is,
  isAll,
  OVEException,
  OVEExceptionSchema,
  Response,
  Info,
  Status,
  ID,
  Image,
  Optional,
  isDefined,
  SourceSchemas
} from "@ove/ove-types";
import { z } from "zod";

export const getDevices = (tag?: string): Device[] | OVEException => {
  const devices = Utils.getDevices().filter(device => tag === undefined || device.tags.includes(tag));

  if (devices.length === 0) {
    const tagStatus = tag === undefined ? ` with tag: ${tag}` : "";
    return OVEUtils.raise(`No device found${tagStatus}`);
  }

  return devices;
};

export const getDevice = (did: string): Device | OVEException => {
  const device = Utils.getDevices().find(({ id }) => did === id);

  if (device === undefined) {
    return OVEUtils.raise(`No device found with id: ${did}`);
  }

  return device;
};

const _getInfo = async (device: Device, type?: string): Promise<Optional<Info | OVEException>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.info?.(device, { type });
};

export const getInfo = async (deviceId: string, type?: string): Promise<Info | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await _getInfo(device, type);

  if (result === undefined) return OVEUtils.raise("'info' command not available on device");

  return result;
};

export const getInfoAll = async (tag?: string, type?: string): Promise<(Info | OVEException)[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => _getInfo(device, type)));

  if (isAll(z.undefined(), results)) return OVEUtils.raise("'info' command not available on devices");

  return results.filter(isDefined);
};

const _getStatus = async (device: Device): Promise<Optional<Response | OVEException>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.status?.(device, {});
};

export const getStatus = async (deviceId: string): Promise<Response | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await _getStatus(device);

  if (result === undefined) return OVEUtils.raise("'status' command not recognised");

  return result;
};

export const getStatusAll = async (tag?: string): Promise<(Response | OVEException)[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const statuses = await Promise.all(devices.map(_getStatus));

  if (isAll(z.undefined(), statuses)) return OVEUtils.raise("'status' command not available on devices");

  return statuses.filter(isDefined);
};

const _getBrowserStatus = async (device: Device, browserId: number): Promise<Optional<Response | OVEException>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.getBrowserStatus?.(device, { browserId });
};

export const getBrowserStatus = async (deviceId: string, browserId: number): Promise<Response | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await _getBrowserStatus(device, browserId);

  if (result === undefined) return OVEUtils.raise("'getBrowserStatus' command not available on device");

  return result;
};

export const getBrowserStatusAll = async (browserId: number, tag?: string): Promise<(Response | OVEException)[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => _getBrowserStatus(device, browserId)));

  if (isAll(z.undefined(), results)) return OVEUtils.raise("'getBrowserStatus' command not available on devices");

  return results.filter(isDefined);
};

const _getBrowsers = async (device: Device): Promise<Optional<ID[] | OVEException>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.getBrowsers?.(device, {});
};

export const getBrowsers = async (deviceId: string): Promise<ID[] | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await _getBrowsers(device);

  if (result === undefined) return OVEUtils.raise("'getBrowsers' command not available on device");

  return result;
};

export const getBrowsersAll = async (tag?: string): Promise<(ID[] | OVEException)[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(_getBrowsers));

  if (isAll(z.undefined(), results)) return OVEUtils.raise("'getBrowsers' command not available on device");

  return results.filter(isDefined);
};

export const addDevice = async (device: Device): Promise<Status> => {
  const devices = [...Utils.getDevices(), device];
  Utils.saveDevices(devices);
  return true;
};

const _reboot = async (device: Device): Promise<Optional<Status | OVEException>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.reboot?.(device, {});
};

export const reboot = async (deviceId: string): Promise<Status | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await _reboot(device);

  if (result === undefined) return OVEUtils.raise("'reboot' command not available on device");

  return result;
};

export const rebootAll = async (tag?: string): Promise<(Status | OVEException)[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(_reboot));

  if (isAll(z.undefined(), results)) return OVEUtils.raise("'reboot' command not available on devices");

  return results.filter(isDefined);
};

const _shutdown = async (device: Device): Promise<Optional<Status | OVEException>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.shutdown?.(device, {});
};

export const shutdown = async (deviceId: string): Promise<Status | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await _shutdown(device);

  if (result === undefined) return OVEUtils.raise("'shutdown' command not available on device");

  return result;
};

export const shutdownAll = async (tag?: string): Promise<(Status | OVEException)[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(_shutdown));

  if (isAll(z.undefined(), results)) return OVEUtils.raise("'shutdown' command not available on devices");

  return results.filter(isDefined);
};

const _start = async (device: Device): Promise<Optional<Status | OVEException>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.start?.(device, {});
};

export const start = async (deviceId: string): Promise<Status | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await _start(device);

  if (result === undefined) return OVEUtils.raise("'start' command not available on device");

  return result;
};

export const startAll = async (tag?: string): Promise<(Status | OVEException)[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(_start));

  if (isAll(z.undefined(), results)) return OVEUtils.raise("'start' command not available on devices");

  return results.filter(isDefined);
};

export const execute = async (deviceId: string, command: string): Promise<Response | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = service.execute?.(device, { command });

  if (result === undefined) {
    return OVEUtils.raise("'execute' command not available on device");
  }

  return result;
};

export const executeAll = async (command: string, tag?: string): Promise<Response[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => execute(device.id, command)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'execute' command not available on device");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

export const screenshot = async (deviceId: string, method: string, screens: number[]): Promise<Image[] | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = service.screenshot?.(device, { method, screens });

  if (result === undefined) {
    return OVEUtils.raise("'screenshot' not available on device");
  }

  return result;
};

export const screenshotAll = async (method: string, screens: number[], tag?: string): Promise<Image[][] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => screenshot(device.id, method, screens)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'screenshot' command not available on devices");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

export const openBrowser = async (deviceId: string, displayId: number): Promise<ID | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = service.openBrowser?.(device, { displayId });

  if (result === undefined) {
    return OVEUtils.raise("'openBrowser' command not available on device");
  }

  return result;
};

export const openBrowserAll = async (displayId: number, tag?: string): Promise<ID[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => openBrowser(device.id, displayId)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'openBrowser' command not available on devices");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

const _setVolume = async (device: Device, volume: number): Promise<Optional<Status | OVEException>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.setVolume?.(device, { volume });
};

export const setVolume = async (deviceId: string, volume: number): Promise<Status | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await _setVolume(device, volume);

  if (result === undefined) return OVEUtils.raise("'setVolume' command not available on device");

  return result;
};

export const setVolumeAll = async (volume: number, tag?: string): Promise<(Status | OVEException)[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => _setVolume(device, volume)));

  if (isAll(z.undefined(), results)) return OVEUtils.raise("'setVolume' command not available on devices");

  return results.filter(isDefined);
};

const _setSource = async (device: Device, source: z.infer<typeof SourceSchemas>, channel?: number): Promise<Optional<Status | OVEException>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.setSource?.(device, { source, channel });
};

export const setSource = async (id: string, source: z.infer<typeof SourceSchemas>, channel?: number): Promise<Status | OVEException> => {
  const device = getDevice(id);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await _setSource(device, source, channel);

  if (result === undefined) return OVEUtils.raise("'setSource' command not available on device");

  return result;
};

export const setSourceAll = async (source: z.infer<typeof SourceSchemas>, channel?: number, tag?: string): Promise<(Status | OVEException)[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => _setSource(device, source, channel)));

  if (isAll(z.undefined(), results)) return OVEUtils.raise("'setSource' command not available on devices");

  return results.filter(isDefined);
};

export const closeBrowser = async (deviceId: string, browserId: number): Promise<Status | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = service.closeBrowser?.(device, { browserId });

  if (result === undefined) {
    return OVEUtils.raise("'closeBrowser' command not available on device");
  }

  return result;
};

export const closeBrowserAll = async (browserId: number, tag?: string): Promise<Status[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => closeBrowser(device.id, browserId)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'closeBrowser' command not available on devices");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

export const closeBrowsers = async (deviceId: string): Promise<Status | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = service.closeBrowsers?.(device, {});

  if (result === undefined) {
    return OVEUtils.raise("'closeBrowsers' command not available on device");
  }

  return result;
};

export const closeBrowsersAll = async (tag?: string): Promise<Status[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => closeBrowsers(device.id)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'closeBrowsers' command not available on device");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

export const removeDevice = async (did: string): Promise<Status> => {
  const devices = Utils.getDevices().filter(({ id }) => id === did);
  Utils.saveDevices(devices);
  return true;
};

const getServiceForProtocol = (protocol: string): typeof NodeService | typeof MDCService | typeof ProjectorService => {
  switch (protocol) {
    case "node":
      return NodeService;
    case "projector":
      return ProjectorService;
    case "screen":
      return MDCService;
    default:
      throw new Error(`Unknown protocol: ${protocol}`);
  }
};
