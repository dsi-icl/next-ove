import { DeviceService } from "../utils/types";
import NodeService from "./node-service";
import MDCService from "./mdc-service";
import ProjectorService from "./projector-service";
import * as Utils from "../utils/utils";
import { Device } from "@ove/ove-types";

export const getDevices = (tag?: string): Device[] => Utils.getDevices().filter(device => tag === undefined || device.tags.includes(tag));

export const getDevice = (did: string): Device | undefined => Utils.getDevices().find(({ id }) => did === id);

export const getInfo = (device: Device, type?: string) => getServiceForProtocol(device.protocol).info(device, type);

export const getInfoAll = (devices: Device[], type?: string) => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).info(device, type)));

export const getStatus = (device: Device) => getServiceForProtocol(device.protocol).status(device);

export const getStatusAll = (devices: Device[]): Promise<{ status: string }[]> => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).status(device)));

export const getBrowserStatus = (device: Device, browserId: number) => getServiceForProtocol(device.protocol).getBrowserStatus(device, browserId);

export const getBrowserStatusAll = (devices: Device[], browserId: number): Promise<{ status: string }[]> => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).getBrowserStatus(device, browserId)));

export const getBrowsers = (device: Device) => getServiceForProtocol(device.protocol).getBrowsers(device);

export const getBrowsersAll = (devices: Device[]): Promise<number[][]> => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).getBrowsers(device)));

export const addDevice = (device: Device) => {
  const devices = [...Utils.getDevices(), device];
  Utils.saveDevices(devices);
  return { status: "Device added" };
};

export const reboot = async (device: Device): Promise<string> => getServiceForProtocol(device.protocol).reboot(device);

export const rebootAll = async (devices: Device[]): Promise<string[]> => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).reboot(device)));

export const shutdown = async (device: Device): Promise<string> => getServiceForProtocol(device.protocol).shutdown(device);

export const shutdownAll = async (tag?: string): Promise<string[]> => Promise.all(getDevices(tag).map(device => getServiceForProtocol(device.protocol).shutdown(device)));

export const start = async (device: Device) => getServiceForProtocol(device.protocol).start(device);

export const startAll = async (devices: Device[]) => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).start(device)));

export const execute = async (device: Device, command: string): Promise<string> => getServiceForProtocol(device.protocol).execute(device, command);

export const executeAll = async (devices: Device[], command: string): Promise<string[]> => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).execute(device, command)));

export const screenshot = (device: Device, method: string, format: string, screens: number[]) => getServiceForProtocol(device.protocol).screenshot(device, method, format, screens);

export const screenshotAll = (devices: Device[], method: string, format: string, screens: number[]): Promise<string[][]> => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).screenshot(device, method, format, screens)));

export const openBrowser = (device: Device, displayId: number) => getServiceForProtocol(device.protocol).openBrowser(device, displayId);

export const openBrowserAll = (devices: Device[], displayId: number) => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).openBrowser(device, displayId)));

export const closeBrowser = (device: Device, browserId: number) => getServiceForProtocol(device.protocol).closeBrowser(device, browserId);

export const closeBrowserAll = (devices: Device[], browserId: number) => Promise.all(devices.map(device => getServiceForProtocol(device.protocol).closeBrowser(device, browserId)));

export const closeBrowsers = (device: Device) => getServiceForProtocol(device.protocol).closeBrowsers(device);

export const closeBrowsersAll = (tag?: string) => Promise.all(getDevices(tag).map(device => getServiceForProtocol(device.protocol).closeBrowsers(device)));

export const removeDevice = (did: string) => {
  const devices = Utils.getDevices().filter(({ id }) => id === did);
  Utils.saveDevices(devices);
  return { status: "Device added" };
};

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
