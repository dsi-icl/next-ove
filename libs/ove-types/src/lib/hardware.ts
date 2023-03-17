import { z } from "zod";
import { OVEException, OVEExceptionSchema, Response } from "./ove-types";
import { MDCSourceSchema } from "@ove/mdc-control";

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

export type BridgeResponse<Response> = {
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
  getDevice: (args: { id: string }, callback: (response: BridgeResponse<DeviceResponse<z.infer<typeof DeviceSchema>>>) => void) => void;
  getDevices: (args: {}, callback: (response: BridgeResponse<DeviceResponse<z.infer<typeof DeviceSchema>[]>>) => void) => void;
  getStatus: (args: { id: string }, callback: (response: BridgeResponse<DeviceResponse<Response>>) => void) => void;
  getStatusAll: (args: { tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Response>>) => void) => void;
  getInfo: (args: { id: string, type?: string }, callback: (response: BridgeResponse<DeviceResponse<Info>>) => void) => void;
  getInfoAll: (args: { type?: string, tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Info>>) => void) => void;
  getBrowserStatus: (args: { id: string, browserId: number }, callback: (response: BridgeResponse<DeviceResponse<Response>>) => void) => void;
  getBrowserStatusAll: (args: { browserId: number, tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Response>>) => void) => void;
  getBrowsers: (args: { id: string }, callback: (response: BridgeResponse<DeviceResponse<ID[]>>) => void) => void;
  getBrowsersAll: (args: { tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<ID[]>>) => void) => void;
  start: (args: { id: string }, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  startAll: (args: { tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  reboot: (args: { id: string }, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  rebootAll: (args: { tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  shutdown: (args: { id: string }, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  shutdownAll: (args: { tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  execute: (args: { id: string, command: string }, callback: (response: BridgeResponse<DeviceResponse<Response>>) => void) => void;
  executeAll: (args: { command: string, tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Response>>) => void) => void;
  screenshot: (args: { id: string, method: ScreenshotMethod, screens: ID[] }, callback: (response: BridgeResponse<DeviceResponse<Image[]>>) => void) => void;
  screenshotAll: (args: { tag?: string, method: ScreenshotMethod, screens: ID[] }, callback: (response: BridgeResponse<MultiDeviceResponse<Image[]>>) => void) => void;
  openBrowser: (args: { id: string, displayId: ID }, callback: (response: BridgeResponse<DeviceResponse<ID>>) => void) => void;
  openBrowserAll: (args: { displayId: ID, tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<ID>>) => void) => void;
  addDevice: (args: { device: z.infer<typeof DeviceSchema> }, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  setVolume: (args: { id: string, volume: number }, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  setVolumeAll: (args: { volume: number, tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  setSource: (args: { id: string, source: z.infer<typeof SourceSchemas>, channel?: number }, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  setSourceAll: (args: { source: z.infer<typeof SourceSchemas>, tag?: string, channel?: number }, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  mute: (args: {id: string}, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  muteAll: (args: {tag?: string}, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  unmute: (args: {id: string}, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  unmuteAll: (args: {tag?: string}, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  muteAudio: (args: {id: string}, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  muteAudioAll: (args: {tag?: string}, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  unmuteAudio: (args: {id: string}, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  unmuteAudioAll: (args: {tag?: string}, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  muteVideo: (args: {id: string}, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  muteVideoAll: (args: {tag?: string}, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  unmuteVideo: (args: {id: string}, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  unmuteVideoAll: (args: {tag?: string}, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  closeBrowser: (args: { id: string, browserId: ID }, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  closeBrowserAll: (args: { browserId: ID, tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  closeBrowsers: (args: { id: string }, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
  closeBrowsersAll: (args: { tag?: string }, callback: (response: BridgeResponse<MultiDeviceResponse<Status>>) => void) => void;
  removeDevice: (args: { id: string }, callback: (response: BridgeResponse<DeviceResponse<Status>>) => void) => void;
}

export const ServiceTypesSchema = z.union([z.literal("node"), z.literal("mdc"), z.literal("pjlink")]);
export type ServiceTypes = z.infer<typeof ServiceTypesSchema>;

export const DeviceSchema = z.object({
  id: z.string(),
  description: z.string(),
  ip: z.string(),
  port: z.number(),
  protocol: ServiceTypesSchema,
  mac: z.string(),
  tags: z.array(z.string())
});

export type Device = z.infer<typeof DeviceSchema>;

export type DeviceResponse<Type> = Type | OVEException;
export type MultiDeviceResponse<Type> =
  { deviceId: string, response: DeviceResponse<Type> }[]
  | OVEException;

export const getDeviceResponseSchema = <T extends z.ZodTypeAny>(schema: T) => z.union([schema, OVEExceptionSchema]);
export const getMultiDeviceResponseSchema = <T extends z.ZodTypeAny>(schema: T) => z.union([z.array(z.object({
  deviceId: z.string(),
  response: getDeviceResponseSchema(schema)
})), OVEExceptionSchema]);

export const getBridgeResponseSchema = <T extends z.ZodTypeAny>(schema: T) => z.object({
  meta: BridgeMetadataSchema,
  response: schema
});

export const ScreenshotMethodSchema = z.union([z.literal("upload"), z.literal("local"), z.literal("response")]);
export type ScreenshotMethod = z.infer<typeof ScreenshotMethodSchema>;

export interface ClientToServerEvents {
}

export type Image = string;
export const ImageSchema = z.string();
export type ID = number;
export const IDSchema = z.number();
export type Status = boolean;
export const StatusSchema = z.boolean();
export type Options = object;
export type Optional<T> = T | undefined;

export type DeviceService<InfoType> = {
  reboot?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  shutdown?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  start?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  info?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<InfoType>>>
  status?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Response>>>
  execute?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Response>>>
  screenshot?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Image[]>>>
  openBrowser?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<ID>>>
  getBrowserStatus?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Response>>>
  closeBrowser?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  closeBrowsers?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  getBrowsers?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<ID[]>>>
  setVolume?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  mute?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  unmute?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  setSource?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  muteAudio?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  unmuteAudio?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  muteVideo?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
  unmuteVideo?: (device: Device, opts: Options) => Promise<Optional<DeviceResponse<Status>>>
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
export const InfoSchema = z.union([NodeInfoSchema, MDCInfoSchema, PJLinkInfoSchema]);