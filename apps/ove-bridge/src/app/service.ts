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
  MDCInfo,
  NodeInfo,
  OVEException,
  OVEExceptionSchema,
  PJLinkInfo,
  Response,
  Info,
  Status,
  ID,
  Image
} from "@ove/ove-types";

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

export const getInfo = async (deviceId: string, type?: string): Promise<MDCInfo | NodeInfo | PJLinkInfo | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = service.info?.(device, { type });

  if (result === undefined) {
    return OVEUtils.raise("'info' command not available on device");
  }

  return result;
};

export const getInfoAll = async (tag?: string, type?: string): Promise<Info[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => getInfo(device.id, type)));

  if (isAll(OVEExceptionSchema, results)) {
    OVEUtils.raise("'info' command not available on devices");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

export const getStatus = async (deviceId: string): Promise<Response | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = await service.status?.(device, {});
  if (result === undefined) {
    return OVEUtils.raise("'status' command not recognised");
  }

  return result;
};

export const getStatusAll = async (tag?: string): Promise<Response[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const statuses = await Promise.all(devices.map(device => getStatus(device.id)));

  if (isAll(OVEExceptionSchema, statuses)) {
    return OVEUtils.raise("'status' command not available on devices");
  }

  return statuses.filter(filterIsNot(OVEExceptionSchema));
};

export const getBrowserStatus = async (deviceId: string, browserId: number): Promise<Response | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = await service.getBrowserStatus?.(device, { browserId });

  if (result === undefined) {
    return OVEUtils.raise("'getBrowserStatus' command not available on device");
  }

  return result;
};

export const getBrowserStatusAll = async (browserId: number, tag?: string): Promise<Response[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => getBrowserStatus(device.id, browserId)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'getBrowserStatus' command not available on devices");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

export const getBrowsers = async (deviceId: string): Promise<ID[] | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = await service.getBrowsers?.(device, {});

  if (result === undefined) {
    return OVEUtils.raise("'getBrowsers' command not available on device");
  }

  return result;
};

export const getBrowsersAll = async (tag?: string): Promise<ID[][] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => getBrowsers(device.id)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'getBrowsers' command not available on device");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

export const addDevice = async (device: Device): Promise<Status> => {
  const devices = [...Utils.getDevices(), device];
  Utils.saveDevices(devices);
  return true;
};

export const reboot = async (deviceId: string): Promise<Status | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = await service.reboot?.(device, {});

  if (result === undefined) {
    return OVEUtils.raise("'reboot' command not available on device");
  }

  return result;
};

export const rebootAll = async (tag?: string): Promise<Status[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => reboot(device.id)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'reboot' command not available on devices");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

export const shutdown = async (deviceId: string): Promise<Status | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = await service.shutdown?.(device, {});

  if (result === undefined) {
    return OVEUtils.raise("'shutdown' command not available on device");
  }

  return result;
};

export const shutdownAll = async (tag?: string): Promise<Status[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => shutdown(device.id)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'shutdown' command not available on devices");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
};

export const start = async (deviceId: string): Promise<Status | OVEException> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const service = getServiceForProtocol(device.protocol);
  const result = service.start?.(device, {});

  if (result === undefined) {
    return OVEUtils.raise("'start' command not available on device");
  }

  return result;
};

export const startAll = async (tag?: string): Promise<Status[] | OVEException> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(device => start(device.id)));

  if (isAll(OVEExceptionSchema, results)) {
    return OVEUtils.raise("'start' command not available on devices");
  }

  return results.filter(filterIsNot(OVEExceptionSchema));
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
