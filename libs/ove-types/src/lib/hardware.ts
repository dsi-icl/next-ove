import { z } from "zod";
import { OVEException, Response } from "./ove-types";
import { MDCSource, MDCSourceSchema } from "@ove/mdc-control";

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

export const NodeInfoSchema = z.discriminatedUnion("type", [
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

export type NodeInfo = z.infer<typeof NodeInfoSchema>;

export const MDCInfoSchema = z.object({
  power: z.string(),
  volume: z.string(),
  isMuted: z.string(),
  source: z.string(),
  model: z.string()
});

export type MDCInfo = z.infer<typeof MDCInfoSchema>;

export type WSResponse<Response> = {
  meta: {
    bridge: string
  }
  response: Response
};

export const BridgeMetadataSchema = z.object({ bridge: z.string() });

export const PJLinkInfoSchema = z.object({
  info: z.string()
});
export type PJLinkInfo = z.infer<typeof PJLinkInfoSchema>;

export interface ServerToClientEvents {
  getDevice: (args: { id: string }, callback: (response: WSResponse<z.infer<typeof DeviceSchema> | OVEException>) => void) => void;
  getDevices: (args: {}, callback: (response: WSResponse<z.infer<typeof DeviceSchema>[] | OVEException>) => void) => void;
  getStatus: (args: { id: string }, callback: (response: WSResponse<Response | OVEException>) => void) => void;
  getStatusAll: (args: { tag?: string }, callback: (response: WSResponse<(Response | OVEException)[] | OVEException>) => void) => void;
  getInfo: (args: { id: string, type?: string }, callback: (response: WSResponse<Info | OVEException>) => void) => void;
  getInfoAll: (args: { type?: string, tag?: string }, callback: (response: WSResponse<(Info | OVEException)[] | OVEException>) => void) => void;
  getBrowserStatus: (args: { id: string, browserId: number }, callback: (response: WSResponse<Response | OVEException>) => void) => void;
  getBrowserStatusAll: (args: { browserId: number, tag?: string }, callback: (response: WSResponse<(Response | OVEException)[] | OVEException>) => void) => void;
  getBrowsers: (args: { id: string }, callback: (response: WSResponse<ID[] | OVEException>) => void) => void;
  getBrowsersAll: (args: { tag?: string }, callback: (response: WSResponse<(ID[] | OVEException)[] | OVEException>) => void) => void;
  start: (args: { id: string }, callback: (response: WSResponse<Status | OVEException>) => void) => void;
  startAll: (args: { tag?: string }, callback: (response: WSResponse<(Status | OVEException)[] | OVEException>) => void) => void;
  reboot: (args: { id: string }, callback: (response: WSResponse<Status | OVEException>) => void) => void;
  rebootAll: (args: { tag?: string }, callback: (response: WSResponse<(Status | OVEException)[] | OVEException>) => void) => void;
  shutdown: (args: { id: string }, callback: (response: WSResponse<Status | OVEException>) => void) => void;
  shutdownAll: (args: { tag?: string }, callback: (response: WSResponse<(Status | OVEException)[] | OVEException>) => void) => void;
  execute: (args: { id: string, command: string }, callback: (response: WSResponse<Response | OVEException>) => void) => void;
  executeAll: (args: { command: string, tag?: string }, callback: (response: WSResponse<Response[] | OVEException>) => void) => void;
  screenshot: (args: { id: string, method: string, screens: number[] }, callback: (response: WSResponse<Image[] | OVEException>) => void) => void;
  screenshotAll: (args: { tag?: string, method: string, screens: number[] }, callback: (response: WSResponse<Image[][] | OVEException>) => void) => void;
  openBrowser: (args: { id: string, displayId: number }, callback: (response: WSResponse<ID | OVEException>) => void) => void;
  openBrowserAll: (args: { displayId: number, tag?: string }, callback: (response: WSResponse<ID[] | OVEException>) => void) => void;
  addDevice: (args: { device: z.infer<typeof DeviceSchema> }, callback: (response: WSResponse<Status | OVEException>) => void) => void;
  setVolume: (args: {id: string, volume: number}, callback: (response: WSResponse<Status | OVEException>) => void) => void;
  setVolumeAll: (args: {volume: number, tag?: string}, callback: (response: WSResponse<(Status | OVEException)[] | OVEException>) => void) => void;
  setSource: (args: {id: string, source: z.infer<typeof SourceSchemas>, channel?: number}, callback: (response: WSResponse<Status | OVEException>) => void) => void;
  setSourceAll: (args: {source: z.infer<typeof SourceSchemas>, tag?: string, channel?: number}, callback: (response: WSResponse<(Status | OVEException)[] | OVEException>) => void) => void;
  closeBrowser: (args: { id: string, browserId: number }, callback: (response: WSResponse<Status | OVEException>) => void) => void;
  closeBrowserAll: (args: { browserId: number, tag?: string }, callback: (response: WSResponse<Status[] | OVEException>) => void) => void;
  closeBrowsers: (args: { id: string }, callback: (response: WSResponse<Status | OVEException>) => void) => void;
  closeBrowsersAll: (args: { tag?: string }, callback: (response: WSResponse<Status[] | OVEException>) => void) => void;
  removeDevice: (args: { id: string }, callback: (response: WSResponse<Status | OVEException>) => void) => void;
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

export type Image = string;
export type ID = number;
export type Status = boolean;
export type Options = object;
export type Optional<T> = T | undefined;

export type DeviceService<InfoType, Sources> = {
  reboot?: (device: Device, opts: Options) => Promise<Optional<Status | OVEException>>
  shutdown?: (device: Device, opts: Options) => Promise<Optional<Status | OVEException>>
  start?: (device: Device, opts: Options) => Promise<Optional<Status | OVEException>>
  info?: (device: Device, opts: Options) => Promise<Optional<InfoType | OVEException>>
  status?: (device: Device, opts: Options) => Promise<Optional<Response | OVEException>>
  execute?: (device: Device, opts: Options) => Promise<Response | OVEException>
  screenshot?: (device: Device, opts: Options) => Promise<Image[] | OVEException>
  openBrowser?: (device: Device, opts: Options) => Promise<ID | OVEException>
  getBrowserStatus?: (device: Device, opts: Options) => Promise<Optional<Response | OVEException>>
  closeBrowser?: (device: Device, opts: Options) => Promise<Status | OVEException>
  closeBrowsers?: (device: Device, opts: Options) => Promise<Status | OVEException>
  getBrowsers?: (device: Device, opts: Options) => Promise<Optional<ID[] | OVEException>>
  setVolume?: (device: Device, opts: Options) => Promise<Status | OVEException>
  mute?: (device: Device, opts: Options) => Promise<Status | OVEException>
  unmute?: (device: Device, opts: Options) => Promise<Status | OVEException>
  setSource?: (device: Device, opts: Options) => Promise<Status | OVEException>
};

export const PJLinkSourceSchema = z.object({
  RGB: z.literal(1),
  VIDEO: z.literal(2),
  DIGITAL: z.literal(3),
  STORAGE: z.literal(4),
  NETWORK: z.literal(5)
}).strict();

export type PJLinkSource = z.infer<typeof PJLinkSourceSchema>;

export const SourceSchemas = z.union([MDCSourceSchema.keyof(), PJLinkSourceSchema.keyof()]);

export type Info = PJLinkInfo | NodeInfo | MDCInfo;
export type Sources = MDCSource | PJLinkSource;
export const InfoSchema = z.union([NodeInfoSchema, MDCInfoSchema, PJLinkInfoSchema]);