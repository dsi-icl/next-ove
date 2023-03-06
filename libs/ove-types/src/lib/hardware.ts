import { z } from "zod";
import { OVEException, Status } from "./ove-types";

export const GeneralSchema = z.object({
  version: z.string(),
  time: z.any(),
  type: z.literal("general")
});

export const SystemSchema = z.object({
  system: z.any(),
  bios: z.any(),
  baseboard: z.any(),
  chassis: z.any(),
  type: z.literal("system")
});

export const CpuSchema = z.object({
  cpu: z.any(),
  flags: z.string(),
  cache: z.any(),
  currentSpeed: z.any(),
  temperature: z.any(),
  type: z.literal("cpu")
});

export const MemorySchema = z.object({
  memory: z.any(),
  layout: z.array(z.any()),
  type: z.literal("memory")
});

export const BatterySchema = z.object({
  battery: z.any(),
  type: z.literal("battery")
});

export const GraphicsSchema = z.object({
  graphics: z.any(),
  type: z.literal("graphics")
});

export const OsSchema = z.object({
  os: z.any(),
  uuid: z.any(),
  versions: z.any(),
  shell: z.string(),
  users: z.array(z.any()),
  type: z.literal("os")
});

export const ProcessesSchema = z.object({
  currentLoad: z.any(),
  fullLoad: z.number(),
  processes: z.any(),
  services: z.any(),
  processLoad: z.any(),
  type: z.literal("processes")
});

export const FsSchema = z.object({
  diskLayout: z.array(z.any()),
  blockDevices: z.array(z.any()),
  disksIO: z.any(),
  fsSize: z.array(z.any()),
  fsOpenFiles: z.any(),
  fsStats: z.any(),
  type: z.literal("fs")
});

export const UsbSchema = z.object({
  usb: z.array(z.any()),
  type: z.literal("usb")
});

export const PrinterSchema = z.object({
  printer: z.array(z.any()),
  type: z.literal("printer")
});

export const AudioSchema = z.object({
  audio: z.array(z.any()),
  type: z.literal("audio")
});

export const NetworkSchema = z.object({
  interfaces: z.union([z.array(z.any()), z.any()]),
  interfaceDefault: z.string(),
  gatewayDefault: z.string(),
  stats: z.array(z.any()),
  connections: z.array(z.any()),
  inetChecksite: z.any(),
  inetLatency: z.number(),
  type: z.literal("network")
});

export const WifiSchema = z.object({
  networks: z.array(z.any()),
  interfaces: z.array(z.any()),
  connections: z.array(z.any()),
  type: z.literal("wifi")
});

export const BluetoothSchema = z.object({
  devices: z.array(z.any()),
  type: z.literal("bluetooth")
});

export const DockerSchema = z.object({
  docker: z.any(),
  images: z.array(z.any()),
  containers: z.array(z.any()),
  containerStats: z.array(z.any()),
  containerProcesses: z.array(z.any()),
  volumes: z.array(z.any()),
  type: z.literal("docker")
});

export const VBoxSchema = z.object({
  vbox: z.any(),
  type: z.literal("vbox")
});

export const InfoSchema = z.discriminatedUnion("type", [
  GeneralSchema,
  SystemSchema,
  CpuSchema,
  MemorySchema,
  BatterySchema,
  GraphicsSchema,
  OsSchema,
  ProcessesSchema,
  FsSchema,
  UsbSchema,
  PrinterSchema,
  AudioSchema,
  NetworkSchema,
  WifiSchema,
  BluetoothSchema,
  DockerSchema,
  VBoxSchema
]);

export type Info = z.infer<typeof InfoSchema>;

export const MDCInfoSchema = z.object({
  power: z.string(),
  volume: z.string(),
  isMuted: z.string(),
  source: z.string(),
  model: z.string()
});

export type MDCInfo = z.infer<typeof MDCInfoSchema>;

export type WSResponse<Response> = {
  bridge: string,
  response: Response
};

export interface ServerToClientEvents {
  getDevice: (args: {id: string}, callback: (response: WSResponse<z.infer<typeof DeviceSchema>> | OVEException) => void) => void;
  getDevices: (args: {}, callback: (response: WSResponse<z.infer<typeof DeviceSchema>[]> | OVEException) => void) => void;
  getStatus: (args: {id: string}, callback: (response: WSResponse<Status> | OVEException) => void) => void;
  getStatusAll: (args: {tag?: string}, callback: (response: WSResponse<Status[]> | OVEException) => void) => void;
  getInfo: (args: {id: string, type?: string}, callback: (response: WSResponse<Info | MDCInfo> | OVEException) => void) => void;
  getInfoAll: (args: {type?: string, tag?: string}, callback: (response: WSResponse<(Info | MDCInfo)[]> | OVEException) => void) => void;
  getBrowserStatus: (args: {id: string, browserId: number}, callback: (response: WSResponse<Status> | OVEException) => void) => void;
  getBrowserStatusAll: (args: {browserId: number, tag?: string}, callback: (response: WSResponse<Status[]> | OVEException) => void) => void;
  getBrowsers: (args: {id: string}, callback: (response: WSResponse<number[]> | OVEException) => void) => void;
  getBrowsersAll: (args: {tag?: string}, callback: (response: WSResponse<number[][]> | OVEException) => void) => void;
  start: (args: {id: string}, callback: (response: WSResponse<boolean | string> | OVEException) => void) => void;
  startAll: (args: {tag?: string}, callback: (response: WSResponse<(boolean | string)[]> | OVEException) => void) => void;
  reboot: (args: {id: string}, callback: (response: WSResponse<string> | OVEException) => void) => void;
  rebootAll: (args: {tag?: string}, callback: (response: WSResponse<string[]> | OVEException) => void) => void;
  shutdown: (args: {id: string}, callback: (response: WSResponse<string> | OVEException) => void) => void;
  shutdownAll: (args: {tag?: string}, callback: (response: WSResponse<string[]> | OVEException) => void) => void;
  execute: (args: {id: string, command: string}, callback: (response: WSResponse<string> | OVEException) => void) => void;
  executeAll: (args: {command: string, tag?: string}, callback: (response: WSResponse<string[]> | OVEException) => void) => void;
  screenshot: (args: {id: string, method: string, format: string, screens: number[]}, callback: (response: WSResponse<string[]> | OVEException) => void) => void;
  screenshotAll: (args: {tag?: string, method: string, format: string, screens: number[]}, callback: (response: WSResponse<string[][]> | OVEException) => void) => void;
  openBrowser: (args: {id: string, displayId: number}, callback: (response: WSResponse<number> | OVEException) => void) => void;
  openBrowserAll: (args: {displayId: number, tag?: string}, callback: (response: WSResponse<number[]> | OVEException) => void) => void;
  addDevice: (args: {device: z.infer<typeof DeviceSchema>}, callback: (response: WSResponse<Status> | OVEException) => void) => void;
  closeBrowser: (args: {id: string, browserId: number}, callback: (response: WSResponse<Status> | OVEException) => void) => void;
  closeBrowserAll: (args: {browserId: number, tag?: string}, callback: (response: WSResponse<Status[]> | OVEException) => void) => void;
  closeBrowsers: (args: {id: string}, callback: (response: WSResponse<Status> | OVEException) => void) => void;
  closeBrowsersAll: (args: {tag?: string}, callback: (response: WSResponse<Status[]> | OVEException) => void) => void;
  removeDevice: (args: {id: string}, callback: (response: WSResponse<Status> | OVEException) => void) => void;
}

export const DeviceSchema = z.object({
  id: z.string(),
  description: z.string(),
  ip: z.string(),
  port: z.number(),
  protocol: z.string().regex(/^(mdc|node|projector)$/gi),
  mac: z.string(),
  tags: z.array(z.string())
});

export type Device = z.infer<typeof DeviceSchema>;

export interface ClientToServerEvents {
}
