import { z } from "zod";
import { Device, InfoSchema, Status, MDCInfo } from "@ove/ove-types";

export type MDCSource = {
  UNKNOWN: number,
  PC: number,
  DVI: number,
  DVI_VIDEO: number,
  AV: number,
  SVIDEO: number,
  COMPONENT: number,
  MAGICNET: number,
  TV: number,
  DTV: number,
  HDMI1: number,
  HDMI1_PC: number,
  HDMI2: number,
  HDMI2_PC: number,
  DP: number,
  DP2: number,
  DP3: number
};

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
  setVolume: (device: Device, volume: number) => Promise<string>
  mute: (device: Device) => Promise<string>
  unmute: (device: Device) => Promise<string>
  setSource: (device: Device, source: keyof MDCSource) => Promise<string>
};
