import {z} from "zod";
import { DeleteSchema, DeviceIDSchema, DeviceSchema, GetSchema, PostSchema } from "./utils";

export type Device = z.infer<typeof DeviceSchema>;

export type GetData = z.infer<typeof GetSchema>;

export type PostData = z.infer<typeof PostSchema>;

export type DeviceID = z.infer<typeof DeviceIDSchema>;

export type DeleteData = z.infer<typeof DeleteSchema>;

export type DeviceService = {
  reboot: (ip: string, port: number) => Promise<object | boolean>
  shutdown: (ip: string, port: number) => Promise<object | boolean>
  start: (ip: string, port: number, mac: string) => Promise<object | boolean>
  info: (query: string | undefined, ip: string, port: number) => Promise<DeviceResult>
  status: (ip: string, port: number) => Promise<DeviceResult>
  execute: (command: string, ip: string, port: number) => Promise<DeviceResult>
  screenshot: (method: string, format: string, screens: string[], ip: string, port: number) => Promise<DeviceResult>
  openBrowser: (ip: string, port: number) => Promise<DeviceResult>
  getBrowserStatus: (ip: string, port: number) => Promise<DeviceResult>
  closeBrowser: (ip: string, port: number) => Promise<DeviceResult>
};

export type ResponseCallback = (data: object) => void;

export type DeviceResult = object | boolean
