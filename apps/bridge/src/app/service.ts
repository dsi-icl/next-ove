import * as fs from "fs";
import * as path from "path";
import axios from "axios";
import { Device } from "../utils/types";
import { wake } from "../utils/wol";

const devices = JSON.parse(fs.readFileSync(path.join(__dirname, "/assets/hardware.json")).toString());
const deviceProtocol = "http";


export const getDevices = (tag: string): Device[] => {
  if (!tag) {
    return devices;
  } else {
    return devices.filter(x => x.tags.includes(tag));
  }
};

export const getDevice = (id: string): Device => devices.find(({ xid }) => xid === id);

export const addDevice = ({ device }: {device: Device}) => {
  if (!getDevice(device.id)) return { error: "Device already exists" };
  fs.writeFileSync(path.join(__dirname, "assets", "hardware.json"), devices.concat([device]));
  return { status: "Device added" };
};

export const removeDevice = ({ id }) => {
  if (!getDevice(id)) return { error: "Device does not exist" };
  fs.writeFileSync(path.join(__dirname, "assets", "hardware.json"), devices.filter(({ xid }) => id === xid));
  return { status: "Device added" };
};

export const reboot = async (data) => await manageDevice(data, async (ip: string, port: number) => (await axios.post(`${deviceProtocol}://${ip}:${port}/reboot`)).data);

export const shutdown = async (data) => await manageDevice(data, async (ip: string, port: number) => (await axios.post(`${deviceProtocol}://${ip}:${port}/shutdown`)).data);

export const start = async data => await manageDevice(data, async (ip: string, port: number, mac: string): Promise<boolean> => wake(mac, { address: ip }));

const manageDevice = async (
  { id, tag }: { id: string, tag: string },
  callback: (ip: string, port: number, mac?: string) => Promise<object | boolean>
) => {
  if (id !== undefined && tag !== undefined) return { error: "Cannot provide both an ID and a tag" };

  const devices = id !== undefined ? [getDevice(id)] : getDevices(tag);

  return await Promise.all(devices.map(async ({ ip, port, mac }) => await callback(ip, port, mac)));
};
