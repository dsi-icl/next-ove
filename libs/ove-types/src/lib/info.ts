import { z } from "zod";

const GeneralSchema = z.object({
  version: z.string(),
  // time: z.unknown(),
  type: z.literal("general")
});

const SystemSchema = z.object({
  system: z.unknown(),
  bios: z.unknown(),
  baseboard: z.unknown(),
  chassis: z.unknown(),
  type: z.literal("system")
});

const CPUSchema = z.object({
  cpu: z.unknown(),
  flags: z.string(),
  cache: z.unknown(),
  currentSpeed: z.unknown(),
  temperature: z.unknown(),
  type: z.literal("cpu")
});

const MemorySchema = z.object({
  memory: z.unknown(),
  layout: z.array(z.unknown()),
  type: z.literal("memory")
});

const BatterySchema = z.object({
  battery: z.unknown(),
  type: z.literal("battery")
});

const GraphicsSchema = z.object({
  graphics: z.unknown(),
  type: z.literal("graphics")
});

const OSSchema = z.object({
  os: z.unknown(),
  uuid: z.unknown(),
  versions: z.unknown(),
  shell: z.string(),
  users: z.array(z.unknown()),
  type: z.literal("os")
});

const ProcessesSchema = z.object({
  currentLoad: z.unknown(),
  fullLoad: z.number(),
  processes: z.unknown(),
  services: z.unknown(),
  processLoad: z.unknown(),
  type: z.literal("processes")
});

const FSSchema = z.object({
  diskLayout: z.array(z.unknown()),
  blockDevices: z.array(z.unknown()),
  disksIO: z.unknown(),
  fsSize: z.array(z.unknown()),
  fsOpenFiles: z.unknown(),
  fsStats: z.unknown(),
  type: z.literal("fs")
});

const USBSchema = z.object({
  usb: z.array(z.unknown()),
  type: z.literal("usb")
});

const PrinterSchema = z.object({
  printer: z.array(z.unknown()),
  type: z.literal("printer")
});

const AudioSchema = z.object({
  audio: z.array(z.unknown()),
  type: z.literal("audio")
});

const NetworkSchema = z.object({
  interfaces: z.union([z.array(z.unknown()), z.unknown()]),
  interfaceDefault: z.string(),
  gatewayDefault: z.string(),
  stats: z.array(z.unknown()),
  connections: z.array(z.unknown()),
  inetChecksite: z.unknown(),
  inetLatency: z.number(),
  type: z.literal("network")
});

const WifiSchema = z.object({
  networks: z.array(z.unknown()),
  interfaces: z.array(z.unknown()),
  connections: z.array(z.unknown()),
  type: z.literal("wifi")
});

const BluetoothSchema = z.object({
  devices: z.array(z.unknown()),
  type: z.literal("bluetooth")
});

const DockerSchema = z.object({
  docker: z.unknown(),
  images: z.array(z.unknown()),
  containers: z.array(z.unknown()),
  containerStats: z.array(z.unknown()),
  containerProcesses: z.array(z.unknown()),
  volumes: z.array(z.unknown()),
  type: z.literal("docker")
});

const VBoxSchema = z.object({
  vbox: z.unknown(),
  type: z.literal("vbox")
});

export const NodeInfoSchema = z.discriminatedUnion("type", [
  GeneralSchema,
  SystemSchema,
  CPUSchema,
  MemorySchema,
  BatterySchema,
  GraphicsSchema,
  OSSchema,
  ProcessesSchema,
  FSSchema,
  USBSchema,
  PrinterSchema,
  AudioSchema,
  NetworkSchema,
  WifiSchema,
  BluetoothSchema,
  DockerSchema,
  VBoxSchema
]);

export type NodeInfo = z.infer<typeof NodeInfoSchema>;

const test = {}
const parsed = GeneralSchema.safeParse(test)
if (parsed.success) {
  const parsedTest: Info = parsed.data;
}

export const MDCInfoSchema = z.object({
  power: z.string(),
  volume: z.string(),
  isMuted: z.string(),
  source: z.string(),
  model: z.string()
});

export type MDCInfo = z.infer<typeof MDCInfoSchema>;

export const PJLinkInfoSchema = z.object({
  info: z.string(),
  source: z.string(),
  power: z.string(),
  pjlinkClass: z.string(),
  isMuted: z.string(),
  errors: z.string(),
  lamp: z.string(),
  sources: z.string(),
  manufacturer: z.string(),
  product: z.string(),
  name: z.string()
});

export type PJLinkInfo = z.infer<typeof PJLinkInfoSchema>;

export const InfoSchema = z.union([NodeInfoSchema, MDCInfoSchema, PJLinkInfoSchema]);

export type Info = z.infer<typeof InfoSchema>;