import NodeService from "./node-service";
import MDCService from "./mdc-service";
import PJLinkService from "./pjlink-service";
import * as Utils from "../utils/utils";
import { Utils as OVEUtils } from "@ove/ove-utils";
import {
  Device,
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
  SourceSchemas,
  MultiDeviceResponse,
  ScreenshotMethod,
  DeviceResponse,
  ServiceTypes
} from "@ove/ove-types";
import { z } from "zod";

const filterUndefinedResponse = <T>(obj: { deviceId: string, response: T | undefined }): obj is { deviceId: string, response: T } => obj.response !== undefined;

const deviceWrapper = async <T>(callback: (device: Device) => Promise<Optional<DeviceResponse<T>>>, deviceId: string): Promise<OVEException | T> => {
  const device = getDevice(deviceId);

  if (is(OVEExceptionSchema, device)) return device;

  const result = await callback(device);

  if (result === undefined) return OVEUtils.raise(`Command not available on device`);

  return result;
};

const multiDeviceWrapper = async <T>(callback: (device: Device) => Promise<Optional<DeviceResponse<T>>>, tag?: string): Promise<MultiDeviceResponse<T>> => {
  const devices = getDevices(tag);

  if (is(OVEExceptionSchema, devices)) return devices;

  const results = await Promise.all(devices.map(callback));

  if (isAll(z.undefined(), results)) return OVEUtils.raise(`Command not available on devices`);

  const wrapped = results.map((x, i) => ({
    deviceId: devices[i].id,
    response: x
  }));

  return wrapped.filter(filterUndefinedResponse);
};

export const getDevices = (tag?: string): DeviceResponse<Device[]> => {
  const devices = Utils.getDevices().filter(device => tag === undefined || device.tags.includes(tag));

  if (devices.length === 0) {
    const tagStatus = tag === undefined ? ` with tag: ${tag}` : "";
    return OVEUtils.raise(`No device found${tagStatus}`);
  }

  return devices;
};

export const getDevice = (did: string): DeviceResponse<Device> => {
  const device = Utils.getDevices().find(({ id }) => did === id);

  if (device === undefined) {
    return OVEUtils.raise(`No device found with id: ${did}`);
  }

  return device;
};

const _getInfo = async (device: Device, type?: string): Promise<Optional<DeviceResponse<Info>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.info?.(device, { type });
};

export const getInfo = async (deviceId: string, type?: string): Promise<DeviceResponse<Info>> => {
  return deviceWrapper((device: Device) => _getInfo(device, type), deviceId);
};

export const getInfoAll = async (tag?: string, type?: string): Promise<MultiDeviceResponse<Info>> => {
  return multiDeviceWrapper((device: Device) => _getInfo(device, type), tag);
};

const _getStatus = async (device: Device): Promise<Optional<DeviceResponse<Response>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.status?.(device, {});
};

export const getStatus = async (deviceId: string): Promise<DeviceResponse<Response>> => {
  return deviceWrapper(_getStatus, deviceId);
};

export const getStatusAll = async (tag?: string): Promise<MultiDeviceResponse<Response>> => {
  return multiDeviceWrapper(_getStatus, tag);
};

const _getBrowserStatus = async (device: Device, browserId: number): Promise<Optional<DeviceResponse<Response>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.getBrowserStatus?.(device, { browserId });
};

export const getBrowserStatus = async (deviceId: string, browserId: number): Promise<DeviceResponse<Response>> => {
  return deviceWrapper((device: Device) => _getBrowserStatus(device, browserId), deviceId);
};

export const getBrowserStatusAll = async (browserId: number, tag?: string): Promise<MultiDeviceResponse<Response>> => {
  return multiDeviceWrapper((device: Device) => _getBrowserStatus(device, browserId), tag);
};

const _getBrowsers = async (device: Device): Promise<Optional<DeviceResponse<ID[]>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.getBrowsers?.(device, {});
};

export const getBrowsers = async (deviceId: string): Promise<DeviceResponse<ID[]>> => {
  return deviceWrapper(_getBrowsers, deviceId);
};

export const getBrowsersAll = async (tag?: string): Promise<MultiDeviceResponse<ID[]>> => {
  return multiDeviceWrapper(_getBrowsers, tag);
};

export const addDevice = async (device: Device): Promise<DeviceResponse<Status>> => {
  const devices = [...Utils.getDevices(), device];
  Utils.saveDevices(devices);
  return true;
};

const _reboot = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.reboot?.(device, {});
};

export const reboot = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_reboot, deviceId);
};

export const rebootAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_reboot, tag);
};

const _shutdown = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.shutdown?.(device, {});
};

export const shutdown = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_shutdown, deviceId);
};

export const shutdownAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_shutdown, tag);
};

const _start = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.start?.(device, {});
};

export const start = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_start, deviceId);
};

export const startAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_start, tag);
};

const _execute = async (device: Device, command: string): Promise<Optional<DeviceResponse<Response>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.execute?.(device, { command });
};

export const execute = async (deviceId: string, command: string): Promise<DeviceResponse<Response>> => {
  return deviceWrapper((device: Device) => _execute(device, command), deviceId);
};

export const executeAll = async (command: string, tag?: string): Promise<MultiDeviceResponse<Response>> => {
  return multiDeviceWrapper((device: Device) => _execute(device, command), tag);
};

const _screenshot = async (device: Device, method: string, screens: number[]): Promise<Optional<DeviceResponse<Image[]>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.screenshot?.(device, { method, screens });
};

export const screenshot = async (deviceId: string, method: string, screens: number[]): Promise<DeviceResponse<Image[]>> => {
  return deviceWrapper((device: Device) => _screenshot(device, method, screens), deviceId);
};

export const screenshotAll = async (method: ScreenshotMethod, screens: ID[], tag?: string): Promise<MultiDeviceResponse<Image[]>> => {
  return multiDeviceWrapper((device: Device) => _screenshot(device, method, screens), tag);
};

const _openBrowser = async (device: Device, displayId: ID): Promise<Optional<DeviceResponse<ID>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.openBrowser?.(device, { displayId });
};

export const openBrowser = async (deviceId: string, displayId: ID): Promise<DeviceResponse<ID>> => {
  return deviceWrapper((device: Device) => _openBrowser(device, displayId), deviceId);
};

export const openBrowserAll = async (displayId: number, tag?: string): Promise<MultiDeviceResponse<ID>> => {
  return multiDeviceWrapper((device: Device) => _openBrowser(device, displayId), tag);
};

const _setVolume = async (device: Device, volume: number): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.setVolume?.(device, { volume });
};

export const setVolume = async (deviceId: string, volume: number): Promise<DeviceResponse<Status>> => {
  return deviceWrapper((device: Device) => _setVolume(device, volume), deviceId);
};

export const setVolumeAll = async (volume: number, tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper((device: Device) => _setVolume(device, volume), tag);
};

const _setSource = async (device: Device, source: z.infer<typeof SourceSchemas>, channel?: number): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.setSource?.(device, { source, channel });
};

export const setSource = async (deviceId: string, source: z.infer<typeof SourceSchemas>, channel?: number): Promise<DeviceResponse<Status>> => {
  return deviceWrapper((device: Device) => _setSource(device, source, channel), deviceId);
};

export const setSourceAll = async (source: z.infer<typeof SourceSchemas>, channel?: number, tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper((device: Device) => _setSource(device, source, channel), tag);
};

const _mute = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.mute?.(device, {});
};

export const mute = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_mute, deviceId);
};

export const muteAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_mute, tag);
};

const _unmute = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.unmute?.(device, {});
};

export const unmute = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_unmute, deviceId);
};

export const unmuteAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_unmute, tag);
};

const _muteAudio = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.muteAudio?.(device, {});
};

export const muteAudio = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_muteAudio, deviceId);
};

export const muteAudioAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_muteAudio, tag);
};

const _unmuteAudio = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.unmuteAudio?.(device, {});
};

export const unmuteAudio = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_unmuteAudio, deviceId);
};

export const unmuteAudioAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_unmuteAudio, tag);
};

const _muteVideo = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.muteVideo?.(device, {});
};

export const muteVideo = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_muteVideo, deviceId);
};

export const muteVideoAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_muteVideo, tag);
};

const _unmuteVideo = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.unmuteVideo?.(device, {});
};

export const unmuteVideo = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_unmuteVideo, deviceId);
};

export const unmuteVideoAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_unmuteVideo, tag);
};

const _closeBrowser = async (device: Device, browserId: number): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.closeBrowser?.(device, { browserId });
};

export const closeBrowser = async (deviceId: string, browserId: number): Promise<DeviceResponse<Status>> => {
  return deviceWrapper((device: Device) => _closeBrowser(device, browserId), deviceId);
};

export const closeBrowserAll = async (browserId: number, tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper((device: Device) => _closeBrowser(device, browserId), tag);
};

const _closeBrowsers = async (device: Device): Promise<Optional<DeviceResponse<Status>>> => {
  const service = getServiceForProtocol(device.protocol);
  return service.closeBrowsers?.(device, {});
};

export const closeBrowsers = async (deviceId: string): Promise<DeviceResponse<Status>> => {
  return deviceWrapper(_closeBrowsers, deviceId);
};

export const closeBrowsersAll = async (tag?: string): Promise<MultiDeviceResponse<Status>> => {
  return multiDeviceWrapper(_closeBrowsers, tag);
};

export const removeDevice = async (did: string): Promise<DeviceResponse<Status>> => {
  const devices = Utils.getDevices().filter(({ id }) => id === did);
  Utils.saveDevices(devices);
  return true;
};

const getServiceForProtocol = (protocol: ServiceTypes): typeof NodeService | typeof MDCService | typeof PJLinkService => {
  switch (protocol) {
    case "node":
      return NodeService;
    case "pjlink":
      return PJLinkService;
    case "mdc":
      return MDCService;
  }
};
