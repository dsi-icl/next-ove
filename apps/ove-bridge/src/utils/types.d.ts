import { z } from "zod";
import { DeviceIDSchema, DeviceSchema } from "./schemas";

export type Device = z.infer<typeof DeviceSchema>;

export type DeviceID = z.infer<typeof DeviceIDSchema>;

export type DeviceService = {
  reboot: () => Promise<DeviceResult>
  shutdown: () => Promise<DeviceResult>
  start: (ip: string, port: number, mac: string) => Promise<DeviceResult>
  info: (type: string | undefined) => Promise<DeviceResult>
  status: (ip: string, port: number) => Promise<DeviceResult>
  execute: (command: string) => Promise<DeviceResult>
  screenshot: (method: string, format: string, screens: number[]) => Promise<DeviceResult>
  openBrowser: (displayId: number) => Promise<DeviceResult>
  getBrowserStatus: (id: number) => Promise<DeviceResult>
  closeBrowser: (id: number) => Promise<DeviceResult>
  closeBrowsers: () => Promise<DeviceResult>
  getBrowsers: () => Promise<DeviceResult>
};

export type DeviceResult = object | boolean | number
