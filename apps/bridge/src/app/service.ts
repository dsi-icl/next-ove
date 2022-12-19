import axios from "axios";
import { Device, DeviceID } from "../utils/types";
import { wake } from "../utils/wol";
import * as Utils from "../utils/utils";
import { saveDevices } from "../utils/utils";

const devices = Utils.getDevices();
const deviceProtocol = "http";


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

export const reboot = async (id: DeviceID) => await manageDevice(id, async (ip: string, port: number) => (await axios.post(`${deviceProtocol}://${ip}:${port}/reboot`)).data);

export const shutdown = async (id: DeviceID) => await manageDevice(id, async (ip: string, port: number) => (await axios.post(`${deviceProtocol}://${ip}:${port}/shutdown`)).data);

export const start = async (id: DeviceID) => await manageDevice(id, async (ip: string, port: number, mac: string): Promise<boolean> => wake(mac, { address: ip }));

const manageDevice = async (
  { id, tag }: DeviceID,
  callback: (ip: string, port: number, mac?: string) => Promise<object | boolean>
) => {
  const devices = id !== undefined ? [getDevice(id)] : getDevices(tag);

  return await Promise.all(devices.map(async ({ ip, port, mac }) => await callback(ip, port, mac)));
};
