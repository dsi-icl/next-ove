import { z } from "zod";
import { DeleteSchema, DeviceIDSchema, DeviceSchema, GetSchema, PostSchema } from "./utils";

export type Device = z.infer<typeof DeviceSchema>;

export type GetData = z.infer<typeof GetSchema>;

export type PostData = z.infer<typeof PostSchema>;

export type DeviceID = z.infer<typeof DeviceIDSchema>;

export type DeleteData = z.infer<typeof DeleteSchema>;

export type DeviceService = {
  reboot: () => Promise<DeviceResult>
  shutdown: () => Promise<DeviceResult>
  start: (ip: string, port: number, mac: string) => Promise<DeviceResult>
  info: (type: string | undefined) => Promise<DeviceResult>
  status: () => Promise<DeviceResult>
  execute: (command: string) => Promise<DeviceResult>
  screenshot: (method: string, format: string, screens: string[]) => Promise<DeviceResult>
  openBrowser: () => Promise<DeviceResult>
  getBrowserStatus: (id: number) => Promise<DeviceResult>
  closeBrowser: (id: number) => Promise<DeviceResult>
  getBrowsers: () => Promise<DeviceResult>
  getDisplays: () => Promise<DeviceResult>
};

export type ResponseCallback = (data: object) => void;

export type DeviceResult = object | boolean | number
