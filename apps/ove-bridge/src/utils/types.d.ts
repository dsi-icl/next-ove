import { z } from "zod";
import { Device, InfoSchema, Status } from "@ove/ove-types";
import { MDCInfo } from "../app/mdc-service";

export type DeviceService = {
  reboot: (device: Device) => Promise<string>
  shutdown: (device: Device) => Promise<string>
  start: (device: Device) => Promise<boolean | string>
  info: (device: Device, type?: string) => Promise<z.infer<typeof InfoSchema> | MDCInfo>
  status: (device: Device) => Promise<{ status: string }>
  execute: (device: Device, command: string) => Promise<string>
  screenshot: (device: Device, method: string, format: string, screens: number[]) => Promise<string[]>
  openBrowser: (device: Device, displayId: number) => Promise<number>
  getBrowserStatus: (device: Device, id: number) => Promise<Status>
  closeBrowser: (device: Device, id: number) => Promise<Status>
  closeBrowsers: (device: Device) => Promise<Status>
  getBrowsers: (device: Device) => Promise<number[]>
};
