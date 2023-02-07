import { Device, DeviceID, DeviceResult, DeviceService } from "../utils/types";
import NodeService from "./node-service";
import MDCService from "./mdc-service";
import ProjectorService from "./projector-service";
import { Utils as OVEUtils } from "@ove/ove-utils";
import * as Utils from "../utils/utils";

let devices: Device[] = Utils.getDevices();

export const getDevices = (tag?: string): Device[] => {
  if (tag === undefined) {
    return devices;
  } else {
    return devices.filter(x => x.tags.includes(tag));
  }
};

export const getDevice = (did: string): Device | undefined => devices.find(({ id }) => did === id);

export const addDevice = (device: Device) => {
  devices = [...devices, device];
  Utils.saveDevices(devices);
  return { status: "Device added" };
};

export const removeDevice = (did: string) => {
  devices = devices.filter(({ id }) => id === did);
  Utils.saveDevices(devices);
  return { status: "Device added" };
};

export const reboot = (id: DeviceID) => manageDevice("reboot", id);

export const shutdown = (id: DeviceID) => manageDevice("shutdown", id);

export const start = (id: DeviceID) => manageDevice("start", id);

export const info = (id: DeviceID, type?: string) => manageDevice("info", id, type);

export const status = (id: DeviceID) => manageDevice("status", id);

export const execute = (id: DeviceID, command: string) => manageDevice("execute", id, command);

export const screenshot = (id: DeviceID, method: string, format: string, screens: string[]) => manageDevice("screenshot", id, method, format, screens);

export const openBrowser = (id: DeviceID) => manageDevice("openBrowser", id);

export const getBrowserStatus = (id: DeviceID, browserId: number) => manageDevice("getBrowserStatus", id, browserId);

export const closeBrowser = (id: DeviceID, browserId: number) => manageDevice("closeBrowser", id, browserId);

export const closeBrowsers = (id: DeviceID) => manageDevice("closeBrowsers", id);

export const getBrowsers = (id: DeviceID) => manageDevice("getBrowsers", id);

export const getDisplays = (id: DeviceID) => manageDevice("getDisplays", id);

const manageDevice = (
  fn: keyof DeviceService,
  did?: DeviceID,
  ...args: any[]
): Promise<DeviceResult[]> => {
  let devices: (Device | undefined)[] = did !== undefined ? (did.id !== undefined ? [getDevice(did.id)] : getDevices(did.tag)) : getDevices();

  if (devices.includes(undefined)) {
    throw new Error("Device not found");
  }

  const getServiceForProtocol = (protocol: string): DeviceService => {
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

  return Promise.all(devices.filter(OVEUtils.notEmpty).map(async device => {
    const service = getServiceForProtocol(device.protocol);
    if (!(fn in service)) {
      throw new Error(`Protocol ${device.protocol} does not support operation: ${fn}`);
    }
    const r: ((...args: any[]) => Promise<DeviceResult>) = service[fn as keyof typeof service];
    return await r(...{ ...args, ...device });
  }));
};
