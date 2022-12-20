import * as Utils from "../utils/utils";
import { Device, DeviceID, DeviceResult, DeviceService } from "../utils/types";
import { saveDevices } from "../utils/utils";
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

export const getDevice = (did: string): Device => devices.find(({ id }) => did === id);

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

export const info = async (query: string, id: DeviceID): Promise<DeviceResult[]> => manageDevice(id, (service: DeviceService) => (ip: string, port: number) => service.info(query, ip, port));

const manageDevice = async (
  { id, tag }: DeviceID,
  callback: (service: DeviceService) => (ip: string, port: number, mac: string) => Promise<DeviceResult>
): Promise<DeviceResult[]> => {
  const devices = id !== undefined ? [getDevice(id)] : getDevices(tag);

  const handleService = protocol => {
    switch (protocol) {
      case "node":
        return NodeService;
      case "mdc":
        return MDCService;
      case "projector":
        return ProjectorService;
    }
  };

  return Promise.all(devices.map(async ({ip, port, mac, protocol}) => callback(handleService(protocol))(ip, port, mac)));
};
