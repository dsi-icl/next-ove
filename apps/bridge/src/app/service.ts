import * as Utils from "../utils/utils";
import { Device, DeviceID, DeviceResult, DeviceService } from "../utils/types";
import { notEmpty, saveDevices } from "../utils/utils";
import NodeService from "./node-service";
import MDCService from "./mdc-service";
import ProjectorService from "./projector-service";

const devices = Utils.getDevices();

export const getDevices = (tag: string | undefined): Device[] => {
  if (tag === undefined) {
    return devices;
  } else {
    return devices.filter(x => x.tags.includes(tag));
  }
};

export const getDevice = (did: string): Device | undefined => devices.find(({ id }) => did === id);

export const addDevice = (device: Device) => {
  saveDevices(devices.concat([device]));
  return { status: "Device added" };
};

export const removeDevice = (did: string) => {
  saveDevices(devices.filter(({ id }) => id === did));
  return { status: "Device added" };
};

export const reboot = async (id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => service.reboot);

export const shutdown = async (id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => service.shutdown);

export const start = async (id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => service.start);

export const info = async (query: string | undefined, id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => (ip: string, port: number) => service.info(query, ip, port));

export const status = async (id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => service.status);

export const execute = async (command: string, id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => (ip: string, port: number) => service.execute(command, ip, port));

export const screenshot = async (method: string, format: string, screens: string[], id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => (ip: string, port: number) => service.screenshot(method, format, screens, ip, port));

export const openBrowser = async (id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => service.openBrowser);

export const getBrowserStatus = async (id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => service.getBrowserStatus);

export const closeBrowser = async (id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => service.closeBrowser);

const manageDevice = async (
  { id, tag }: DeviceID,
  callback: (service: DeviceService) => (ip: string, port: number, mac: string) => Promise<DeviceResult>
): Promise<DeviceResult[]> => {
  const devices: (Device | undefined)[] = id !== undefined ? [getDevice(id)] : getDevices(tag);

  if (devices.includes(undefined)) {
    return [{error: "Device not found"}];
  }

  const handleService = (protocol: string) => {
    switch (protocol) {
      case "node":
        return NodeService;
      case "mdc":
        return MDCService;
      case "projector":
        return ProjectorService;
      default:
        throw new Error(`Unknown protocol: ${protocol}`);
    }
  };

  return Promise.all(devices.filter(notEmpty).map(async ({ip, port, mac, protocol}) => callback(handleService(protocol))(ip, port, mac)));
};
