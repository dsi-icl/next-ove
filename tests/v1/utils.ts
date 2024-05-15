// noinspection JSUnusedGlobalSymbols

import { z } from "zod";
import { Systeminformation } from "systeminformation";
import TimeData = Systeminformation.TimeData;
import RaspberryRevisionData = Systeminformation.RaspberryRevisionData;
import SystemData = Systeminformation.SystemData;
import BiosData = Systeminformation.BiosData;
import BaseboardData = Systeminformation.BaseboardData;
import ChassisData = Systeminformation.ChassisData;
import CpuCacheData = Systeminformation.CpuCacheData;
import CpuData = Systeminformation.CpuData;
import CpuCurrentSpeedData = Systeminformation.CpuCurrentSpeedData;
import CpuTemperatureData = Systeminformation.CpuTemperatureData;
import MemData = Systeminformation.MemData;
import MemLayoutData = Systeminformation.MemLayoutData;
import SmartData = Systeminformation.SmartData;
import DiskLayoutData = Systeminformation.DiskLayoutData;
import BatteryData = Systeminformation.BatteryData;
import GraphicsControllerData = Systeminformation.GraphicsControllerData;
import GraphicsDisplayData = Systeminformation.GraphicsDisplayData;
import GraphicsData = Systeminformation.GraphicsData;
import OsData = Systeminformation.OsData;
import UuidData = Systeminformation.UuidData;
import VersionData = Systeminformation.VersionData;
import UserData = Systeminformation.UserData;
import FsSizeData = Systeminformation.FsSizeData;
import FsOpenFilesData = Systeminformation.FsOpenFilesData;
import BlockDevicesData = Systeminformation.BlockDevicesData;
import FsStatsData = Systeminformation.FsStatsData;
import DisksIoData = Systeminformation.DisksIoData;
import NetworkInterfacesData = Systeminformation.NetworkInterfacesData;
import NetworkStatsData = Systeminformation.NetworkStatsData;
import NetworkConnectionsData = Systeminformation.NetworkConnectionsData;
import InetChecksiteData = Systeminformation.InetChecksiteData;
import WifiNetworkData = Systeminformation.WifiNetworkData;
import WifiInterfaceData = Systeminformation.WifiInterfaceData;
import WifiConnectionData = Systeminformation.WifiConnectionData;
import CurrentLoadCpuData = Systeminformation.CurrentLoadCpuData;
import CurrentLoadData = Systeminformation.CurrentLoadData;
import ProcessesProcessData = Systeminformation.ProcessesProcessData;
import ProcessesData = Systeminformation.ProcessesData;
import ProcessesProcessLoadData = Systeminformation.ProcessesProcessLoadData;
import ServicesData = Systeminformation.ServicesData;
import DockerInfoData = Systeminformation.DockerInfoData;
import DockerImageData = Systeminformation.DockerImageData;
import DockerContainerMountData = Systeminformation.DockerContainerMountData;
import DockerContainerData = Systeminformation.DockerContainerData;
import DockerContainerStatsData = Systeminformation.DockerContainerStatsData;
import DockerContainerProcessData = Systeminformation.DockerContainerProcessData;
import DockerVolumeData = Systeminformation.DockerVolumeData;
import VboxInfoData = Systeminformation.VboxInfoData;
import PrinterData = Systeminformation.PrinterData;
import UsbData = Systeminformation.UsbData;
import AudioData = Systeminformation.AudioData;
import BluetoothDeviceData = Systeminformation.BluetoothDeviceData;
import StaticData = Systeminformation.StaticData;
import DynamicData = Systeminformation.DynamicData;

// @ts-ignore
export const TimeDataSchema: z.ZodType<TimeData> = z.strictObject({
  current: z.number(),
  uptime: z.number(),
  timezone: z.string(),
  timezoneName: z.string()
});

// @ts-ignore
export const RaspberryRevisionDataSchema: z.ZodType<RaspberryRevisionData> = z.strictObject({
  manufacturer: z.string(),
  processor: z.string(),
  type: z.string(),
  revision: z.string()
});

// @ts-ignore
export const SystemDataSchema: z.ZodType<SystemData> = z.strictObject({
  manufacturer: z.string(),
  model: z.string(),
  version: z.string(),
  serial: z.string(),
  uuid: z.string(),
  sku: z.string(),
  virtual: z.boolean(),
  virtualHost: z.string().optional(),
  raspberry: RaspberryRevisionDataSchema.optional()
});

// @ts-ignore
export const BiosDataSchema: z.ZodType<BiosData> = z.strictObject({
  vendor: z.string(),
  version: z.string(),
  releaseDate: z.string(),
  revision: z.string(),
  serial: z.string().optional(),
  language: z.string().optional(),
  features: z.string().array().optional()
});

// @ts-ignore
export const BaseboardDataSchema: z.ZodType<BaseboardData> = z.strictObject({
  manufacturer: z.string(),
  model: z.string(),
  version: z.string(),
  serial: z.string(),
  assetTag: z.string(),
  memMax: z.number().nullable(),
  memSlots: z.number().nullable()
});

// @ts-ignore
export const ChassisDataSchema: z.ZodType<ChassisData> = z.strictObject({
  manufacturer: z.string(),
  model: z.string(),
  type: z.string(),
  version: z.string(),
  serial: z.string(),
  assetTag: z.string(),
  sku: z.string()
});

// @ts-ignore
export const CPUCacheDataSchema: z.ZodType<CpuCacheData> = z.strictObject({
  l1d: z.number(),
  l1i: z.number(),
  l2: z.number(),
  l3: z.number().nullable() // error in library type – missing nullable
});

// @ts-ignore
export const CPUDataSchema: z.ZodType<CpuData> = z.strictObject({
  manufacturer: z.string(),
  brand: z.string(),
  vendor: z.string(),
  family: z.string(),
  model: z.string(),
  stepping: z.string(),
  revision: z.string(),
  voltage: z.string(),
  speed: z.number(),
  speedMin: z.number(),
  speedMax: z.number(),
  governor: z.string(),
  cores: z.number(),
  physicalCores: z.number(),
  efficiencyCores: z.number().optional(),
  performanceCores: z.number().optional(),
  processors: z.number(),
  socket: z.string(),
  flags: z.string(),
  virtualization: z.boolean(),
  cache: CPUCacheDataSchema
});

// @ts-ignore
export const CPUCurrentSpeedDataSchema: z.ZodType<CpuCurrentSpeedData> = z.strictObject({
  min: z.number(),
  max: z.number(),
  avg: z.number(),
  cores: z.number().array()
});

// @ts-ignore
export const CPUTemperatureDataSchema: z.ZodType<CpuTemperatureData> = z.strictObject({
  main: z.number().nullable(), // error in library type – missing nullable
  cores: z.number().array(),
  max: z.number().nullable(), // error in library type – missing nullable
  socket: z.number().array().optional(),
  chipset: z.number().optional().nullable() // error in library type – missing nullable
});

// @ts-ignore
export const MemDataSchema: z.ZodType<MemData> = z.strictObject({
  total: z.number(),
  free: z.number(),
  used: z.number(),
  active: z.number(),
  available: z.number(),
  buffcache: z.number(),
  buffers: z.number(),
  cached: z.number(),
  slab: z.number(),
  swaptotal: z.number(),
  swapused: z.number(),
  swapfree: z.number(),
  writeback: z.number().nullable(),
  dirty: z.number().nullable()
});

// @ts-ignore
export const MemLayoutDataSchema: z.ZodType<MemLayoutData> = z.strictObject({
  size: z.number(),
  bank: z.string(),
  type: z.string(),
  ecc: z.boolean().nullable().optional(),
  clockSpeed: z.number().nullable(),
  formFactor: z.string(),
  manufacturer: z.string().optional(),
  partNum: z.string(),
  serialNum: z.string(),
  voltageConfigured: z.number().nullable(),
  voltageMin: z.number().nullable(),
  voltageMax: z.number().nullable()
});

// @ts-ignore
export const SmartDataSchema: z.ZodType<SmartData> = z.strictObject({
  json_format_version: z.number().array(),
  smartctl: z.strictObject({
    version: z.number().array(),
    platform_info: z.string(),
    build_info: z.string(),
    argv: z.string().array(),
    exit_status: z.number()
  }),
  device: z.strictObject({
    name: z.string(),
    info_name: z.string(),
    type: z.string(),
    protocol: z.string()
  }),
  model_family: z.string().optional(),
  model_name: z.string().optional(),
  serial_number: z.string().optional(),
  firmware_version: z.string().optional(),
  smart_status: z.strictObject({
    passed: z.boolean()
  }),
  trim: z.strictObject({
    supported: z.boolean()
  }).optional(),
  ata_smart_attributes: z.strictObject({
    revision: z.number(),
    table: z.strictObject({
      id: z.number(),
      name: z.string(),
      value: z.number(),
      worst: z.number(),
      thresh: z.number(),
      when_failed: z.string(),
      flags: z.strictObject({
        value: z.number(),
        string: z.string(),
        prefailure: z.boolean(),
        updated_online: z.boolean(),
        performance: z.boolean(),
        error_rate: z.boolean(),
        event_count: z.boolean(),
        auto_keep: z.boolean()
      }),
      raw: z.strictObject({
        value: z.number(),
        string: z.string()
      })
    }).array()
  }).optional(),
  ata_smart_error_log: z.strictObject({
    summary: z.strictObject({
      revision: z.number(),
      count: z.number()
    })
  }).optional(),
  ata_smart_self_test_log: z.strictObject({
    standard: z.strictObject({
      revision: z.number(),
      table: z.strictObject({
        type: z.strictObject({
          value: z.number(),
          string: z.string()
        }),
        status: z.strictObject({
          value: z.number(),
          string: z.string(),
          passed: z.boolean()
        }),
        lifetime_hours: z.number()
      }).array(),
      count: z.number(),
      error_count_total: z.number(),
      error_count_outdated: z.number()
    })
  }).optional(),
  nvme_pci_vendor: z.strictObject({
    id: z.number(),
    subsystem_id: z.number()
  }).optional(),
  nvme_smart_health_information_log: z.strictObject({
    critical_warning: z.number().optional(),
    temperature: z.number().optional(),
    available_spare: z.number().optional(),
    available_spare_threshold: z.number().optional(),
    percentage_used: z.number().optional(),
    data_units_read: z.number().optional(),
    data_units_written: z.number().optional(),
    host_reads: z.number().optional(),
    host_writes: z.number().optional(),
    controller_busy_time: z.number().optional(),
    power_cycles: z.number().optional(),
    power_on_hours: z.number().optional(),
    unsafe_shutdowns: z.number().optional(),
    media_errors: z.number().optional(),
    num_err_log_entries: z.number().optional(),
    warning_temp_time: z.number().optional(),
    critical_comp_time: z.number().optional(),
    temperature_sensors: z.number().array().optional()
  }).optional(),
  user_capacity: z.strictObject({
    blocks: z.number(),
    bytes: z.number()
  }).optional(),
  logical_block_size: z.number().optional(),
  temperature: z.strictObject({
    current: z.number()
  }),
  power_cycle_count: z.number(),
  power_on_time: z.strictObject({
    hours: z.number()
  })
});

// @ts-ignore
export const DiskLayoutDataSchema: z.ZodType<DiskLayoutData> = z.strictObject({
  device: z.string(),
  type: z.string(),
  name: z.string(),
  vendor: z.string(),
  size: z.number(),
  bytesPerSector: z.number().nullable(), // error in library type – missing nullable
  totalCylinders: z.number().nullable(), // error in library type – missing nullable
  totalHeads: z.number().nullable(), // error in library type – missing nullable
  totalSectors: z.number().nullable(), // error in library type – missing nullable
  totalTracks: z.number().nullable(), // error in library type – missing nullable
  tracksPerCylinder: z.number().nullable(), // error in library type – missing nullable
  sectorsPerTrack: z.number().nullable(), // error in library type – missing nullable
  firmwareRevision: z.string(),
  serialNum: z.string(),
  interfaceType: z.string(),
  smartStatus: z.string(),
  temperature: z.number().nullable(),
  smartData: SmartDataSchema.optional()
});

const BatteryDataSchemaBase = z.strictObject({
  hasBattery: z.boolean(),
  cycleCount: z.number(),
  isCharging: z.boolean(),
  voltage: z.number(),
  designedCapacity: z.number(),
  maxCapacity: z.number(),
  currentCapacity: z.number(),
  capacityUnit: z.string(),
  percent: z.number(),
  timeRemaining: z.number().nullable(),
  acConnected: z.boolean(),
  type: z.string(),
  model: z.string(),
  manufacturer: z.string(),
  serial: z.string()
});

// @ts-ignore
export const BatteryDataSchema: z.ZodType<BatteryData> = BatteryDataSchemaBase.extend({
  additionalBatteries: z.lazy(() => BatteryDataSchema.array().optional())
});

// @ts-ignore
export const GraphicsControllerDataSchema: z.ZodType<GraphicsControllerData> = z.strictObject({
  vendor: z.string(),
  vendorId: z.string().optional(),
  model: z.string(),
  deviceId: z.string().optional(),
  bus: z.string(),
  busAddress: z.string().optional(),
  vram: z.number().nullable(),
  vramDynamic: z.boolean(),
  external: z.boolean().optional(),
  cores: z.union([z.number(), z.string()]).optional(), // error in library type – missing string as possible union type
  metalVersion: z.string().optional(),
  subDeviceId: z.string().optional(),
  driverVersion: z.string().optional(),
  name: z.string().optional(),
  pciBus: z.string().optional(),
  pciID: z.string().optional(),
  fanSpeed: z.number().optional(),
  memoryTotal: z.number().optional(),
  memoryUsed: z.number().optional(),
  memoryFree: z.number().optional(),
  utilizationGpu: z.number().optional(),
  utilizationMemory: z.number().optional(),
  temperatureGpu: z.number().optional(),
  temperatureMemory: z.number().optional(),
  powerDraw: z.number().optional(),
  powerLimit: z.number().optional(),
  clockCore: z.number().optional(),
  clockMemory: z.number().optional()
});

// @ts-ignore
export const GraphicsDisplayDataSchema: z.ZodType<GraphicsDisplayData> = z.strictObject({
  vendor: z.string(),
  vendorId: z.string().nullable(),
  model: z.string(),
  productionYear: z.union([z.number(), z.string()]).nullable(), // error in library type – missing string as possible union type
  serial: z.string().nullable(),
  deviceName: z.string().nullable().optional(), // error in library type – missing optional
  displayId: z.string().nullable(),
  main: z.boolean(),
  builtin: z.boolean(),
  connection: z.string().nullable(),
  sizeX: z.number().nullable(),
  sizeY: z.number().nullable(),
  pixelDepth: z.number().nullable(),
  resolutionX: z.number().nullable(),
  resolutionY: z.number().nullable(),
  currentResX: z.number().nullable(),
  currentResY: z.number().nullable(),
  positionX: z.number(),
  positionY: z.number(),
  currentRefreshRate: z.number().nullable()
});

// @ts-ignore
export const GraphicsDataSchema: z.ZodType<GraphicsData> = z.strictObject({
  controllers: GraphicsControllerDataSchema.array(),
  displays: GraphicsDisplayDataSchema.array()
});

// 4. Operating System

// @ts-ignore
export const OSDataSchema: z.ZodType<OsData> = z.strictObject({
  platform: z.string(),
  distro: z.string(),
  release: z.string(),
  codename: z.string(),
  kernel: z.string(),
  arch: z.string(),
  hostname: z.string(),
  fqdn: z.string(),
  codepage: z.string(),
  logofile: z.string(),
  serial: z.string(),
  build: z.string(),
  servicepack: z.string(),
  uefi: z.boolean().nullable(),
  hypervizor: z.boolean().optional(),
  remoteSession: z.boolean().optional(),
  hypervisor: z.boolean().optional()
});

// @ts-ignore
export const UUIDDataSchema: z.ZodType<UuidData> = z.strictObject({
  os: z.string(),
  hardware: z.string(),
  macs: z.string().array()
});

// @ts-ignore
export const VersionDataSchema: z.ZodType<VersionData> = z.strictObject({
  kernel: z.string().optional(),
  openssl: z.string().optional(),
  systemOpenssl: z.string().optional(),
  systemOpensslLib: z.string().optional(),
  node: z.string().optional(),
  v8: z.string().optional(),
  npm: z.string().optional(),
  yarn: z.string().optional(),
  pm2: z.string().optional(),
  gulp: z.string().optional(),
  grunt: z.string().optional(),
  git: z.string().optional(),
  tsc: z.string().optional(),
  mysql: z.string().optional(),
  redis: z.string().optional(),
  mongodb: z.string().optional(),
  nginx: z.string().optional(),
  php: z.string().optional(),
  docker: z.string().optional(),
  postfix: z.string().optional(),
  postgresql: z.string().optional(),
  perl: z.string().optional(),
  python: z.string().optional(),
  python3: z.string().optional(),
  pip: z.string().optional(),
  pip3: z.string().optional(),
  java: z.string().optional(),
  gcc: z.string().optional(),
  virtualbox: z.string().optional(),
  dotnet: z.string().optional(),
  apache: z.string().optional(), // error in library type – missing key
  bash: z.string().optional(), // error in library type – missing key
  zsh: z.string().optional(), // error in library type – missing key
  fish: z.string().optional(), // error in library type – missing key
  powershell: z.string().optional() // error in library type – missing key
});

// @ts-ignore
export const UserDataSchema: z.ZodType<UserData> = z.strictObject({
  user: z.string(),
  tty: z.string(),
  date: z.string(),
  time: z.string(),
  ip: z.string(),
  command: z.string()
});

// 5. File System

// @ts-ignore
export const FSSizeDataSchema: z.ZodType<FsSizeData> = z.strictObject({
  fs: z.string(),
  type: z.string(),
  size: z.number(),
  used: z.number(),
  available: z.number(),
  use: z.number(),
  mount: z.string(),
  rw: z.boolean().nullable()
});

// @ts-ignore
export const FSOpenFilesDataSchema: z.ZodType<FsOpenFilesData> = z.strictObject({
  max: z.number(),
  allocated: z.number(),
  available: z.number()
});

// @ts-ignore
export const BlockDevicesDataSchema: z.ZodType<BlockDevicesData> = z.strictObject({
  name: z.string(),
  identifier: z.string(),
  type: z.string(),
  fsType: z.string(),
  mount: z.string(),
  size: z.number(),
  physical: z.string(),
  uuid: z.string(),
  label: z.string(),
  model: z.string(),
  serial: z.string(),
  removable: z.boolean(),
  protocol: z.string(),
  group: z.string().optional(),
  device: z.string().optional()
});

// @ts-ignore
export const FSStatsDataSchema: z.ZodType<FsStatsData> = z.strictObject({
  rx: z.number(),
  wx: z.number(),
  tx: z.number(),
  rx_sec: z.number().nullable(),
  wx_sec: z.number().nullable(),
  tx_sec: z.number().nullable(),
  ms: z.number()
});

// @ts-ignore
export const DisksIODataSchema: z.ZodType<DisksIoData> = z.strictObject({
  rIO: z.number(),
  wIO: z.number(),
  tIO: z.number(),
  rIO_sec: z.number().nullable(),
  wIO_sec: z.number().nullable(),
  tIO_sec: z.number().nullable(),
  rWaitTime: z.number(),
  wWaitTime: z.number(),
  tWaitTime: z.number(),
  rWaitPercent: z.number().nullable(),
  wWaitPercent: z.number().nullable(),
  tWaitPercent: z.number().nullable(),
  ms: z.number()
});

// 6. Network related functions

// @ts-ignore
export const NetworkInterfacesDataSchema: z.ZodType<NetworkInterfacesData> = z.strictObject({
  iface: z.string(),
  ifaceName: z.string(),
  ip4: z.string(),
  ip4subnet: z.string(),
  ip6: z.string(),
  ip6subnet: z.string(),
  mac: z.string(),
  internal: z.boolean(),
  virtual: z.boolean(),
  operstate: z.string(),
  type: z.string(),
  duplex: z.string(),
  mtu: z.number().nullable(),
  speed: z.number().nullable(),
  dhcp: z.boolean(),
  dnsSuffix: z.string(),
  ieee8021xAuth: z.string(),
  ieee8021xState: z.string(),
  carrierChanges: z.number(),
  default: z.boolean().optional() // error in library type – missing key
});

// @ts-ignore
export const NetworkStatsDataSchema: z.ZodType<NetworkStatsData> = z.strictObject({
  iface: z.string(),
  operstate: z.string(),
  rx_bytes: z.number(),
  rx_dropped: z.number(),
  rx_errors: z.number(),
  tx_bytes: z.number(),
  tx_dropped: z.number(),
  tx_errors: z.number(),
  rx_sec: z.number().nullable(), // error in library type – missing nullable
  tx_sec: z.number().nullable(), // error in library type – missing nullable
  ms: z.number()
});

// @ts-ignore
export const NetworkConnectionsDataSchema: z.ZodType<NetworkConnectionsData> = z.strictObject({
  protocol: z.string(),
  localAddress: z.string(),
  localPort: z.string(),
  peerAddress: z.string(),
  peerPort: z.string(),
  state: z.string(),
  pid: z.number(),
  process: z.string()
});

// @ts-ignore
export const InetChecksiteDataSchema: z.ZodType<InetChecksiteData> = z.strictObject({
  url: z.string(),
  ok: z.boolean(),
  status: z.number(),
  ms: z.number()
});

// @ts-ignore
export const WifiNetworkDataSchema: z.ZodType<WifiNetworkData> = z.strictObject({
  ssid: z.string(),
  bssid: z.string().optional().nullable(), // error in library type – missing optional & nullable
  mode: z.string(),
  channel: z.number(),
  frequency: z.number(),
  signalLevel: z.number(),
  quality: z.number(),
  security: z.string().array(),
  wpaFlags: z.string().array(),
  rsnFlags: z.string().array()
});

// @ts-ignore
export const WifiInterfaceDataSchema: z.ZodType<WifiInterfaceData> = z.strictObject({
  id: z.string(),
  iface: z.string(),
  model: z.string(),
  vendor: z.string(),
  mac: z.string()
});

// @ts-ignore
export const WifiConnectionDataSchema: z.ZodType<WifiConnectionData> = z.strictObject({
  id: z.string(),
  iface: z.string(),
  model: z.string(),
  ssid: z.string(),
  bssid: z.string(),
  channel: z.number(),
  type: z.string(),
  security: z.string(),
  frequency: z.number(),
  signalLevel: z.number(),
  txRate: z.union([z.number(), z.string()]) // error in library type –s missing string as possible union type
});

// 7. Current Load, Processes & Services

// @ts-ignore
export const CurrentLoadCPUDataSchema: z.ZodType<CurrentLoadCpuData> = z.strictObject({
  load: z.number(),
  loadUser: z.number(),
  loadSystem: z.number(),
  loadNice: z.number(),
  loadIdle: z.number(),
  loadIrq: z.number(),
  rawLoad: z.number(),
  rawLoadUser: z.number(),
  rawLoadSystem: z.number(),
  rawLoadNice: z.number(),
  rawLoadIdle: z.number(),
  rawLoadIrq: z.number(),
  loadSteal: z.number(),
  loadGuest: z.number(),
  rawLoadSteal: z.number(),
  rawLoadGuest: z.number()
});

// @ts-ignore
export const CurrentLoadDataSchema: z.ZodType<CurrentLoadData> = z.strictObject({
  avgLoad: z.number(),
  currentLoad: z.number(),
  currentLoadUser: z.number(),
  currentLoadSystem: z.number(),
  currentLoadNice: z.number(),
  currentLoadIdle: z.number(),
  currentLoadIrq: z.number(),
  rawCurrentLoad: z.number(),
  rawCurrentLoadUser: z.number(),
  rawCurrentLoadSystem: z.number(),
  rawCurrentLoadNice: z.number(),
  rawCurrentLoadIdle: z.number(),
  rawCurrentLoadIrq: z.number(),
  currentLoadSteal: z.number(),
  currentLoadGuest: z.number(),
  rawCurrentLoadSteal: z.number(),
  rawCurrentLoadGuest: z.number(),
  cpus: CurrentLoadCPUDataSchema.array()
});

// @ts-ignore
export const ProcessesProcessDataSchema: z.ZodType<ProcessesProcessData> = z.strictObject({
  pid: z.number().nullable(), // error in library type –s missing nullable
  parentPid: z.number(),
  name: z.string(),
  cpu: z.number(),
  cpuu: z.number(),
  cpus: z.number(),
  mem: z.number(),
  priority: z.number(),
  memVsz: z.number(),
  memRss: z.number(),
  nice: z.number(),
  started: z.string(),
  state: z.string(),
  tty: z.string(),
  user: z.string(),
  command: z.string(),
  params: z.string(),
  path: z.string()
});

// @ts-ignore
export const ProcessesDataSchema: z.ZodType<ProcessesData> = z.strictObject({
  all: z.number(),
  running: z.number(),
  blocked: z.number(),
  sleeping: z.number(),
  unknown: z.number(),
  list: ProcessesProcessDataSchema.array()
});

// @ts-ignore
export const ProcessesProcessLoadDataSchema: z.ZodType<ProcessesProcessLoadData> = z.strictObject({
  proc: z.string(),
  pid: z.number().nullable(), // error in library type –s missing nullable
  pids: z.number().array(),
  cpu: z.union([z.number(), z.literal("nan"), z.literal("NaN")]).nullable(), // nan accepted as string
  mem: z.union([z.number(), z.literal("nan"), z.literal("NaN")]).nullable() // nan accepted as string
});

// @ts-ignore
export const ServicesDataSchema: z.ZodType<ServicesData> = z.strictObject({
  name: z.string(),
  running: z.boolean(),
  startmode: z.string(),
  pids: z.union([z.number(), z.literal("nan"), z.literal("NaN")]).nullable().array(), // nan accepted as string
  cpu: z.union([z.number(), z.literal("nan"), z.literal("NaN")]).nullable(), // nan accepted as string
  mem: z.union([z.number(), z.literal("nan"), z.literal("NaN")]).nullable() // nan accepted as string
});

// 8. Docker

// @ts-ignore
export const DockerInfoDataSchema: z.ZodType<DockerInfoData> = z.strictObject({
  id: z.string().optional().nullable(), // error in library type – missing optional & nullable
  containers: z.number().optional().nullable(), // error in library type – missing optional & nullable
  containersRunning: z.number().optional().nullable(), // error in library type – missing optional & nullable
  containersPaused: z.number().optional().nullable(), // error in library type – missing optional & nullable
  containersStopped: z.number().optional().nullable(), // error in library type – missing optional & nullable
  images: z.number().optional().nullable(), // error in library type – missing optional & nullable
  driver: z.string().optional().nullable(), // error in library type – missing optional & nullable
  memoryLimit: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  swapLimit: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  kernelMemory: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  cpuCfsPeriod: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  cpuCfsQuota: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  cpuShares: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  cpuSet: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  ipv4Forwarding: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  bridgeNfIptables: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  bridgeNfIp6tables: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  debug: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  nfd: z.number().optional().nullable(), // error in library type – missing optional & nullable
  oomKillDisable: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  ngoroutines: z.number().optional().nullable(), // error in library type – missing optional & nullable
  systemTime: z.string().optional().nullable(), // error in library type – missing optional & nullable
  loggingDriver: z.string().optional().nullable(), // error in library type – missing optional & nullable
  cgroupDriver: z.string().optional().nullable(), // error in library type – missing optional & nullable
  nEventsListener: z.number().optional().nullable(), // error in library type – missing optional & nullable
  kernelVersion: z.string().optional().nullable(), // error in library type – missing optional & nullable
  operatingSystem: z.string().optional().nullable(), // error in library type – missing optional & nullable
  osType: z.string().optional().nullable(), // error in library type – missing optional & nullable
  architecture: z.string().optional().nullable(), // error in library type – missing optional & nullable
  ncpu: z.number().optional().nullable(), // error in library type – missing optional & nullable
  memTotal: z.number().optional().nullable(), // error in library type – missing optional & nullable
  dockerRootDir: z.string().optional().nullable(), // error in library type – missing optional & nullable
  httpProxy: z.string().optional().nullable(), // error in library type – missing optional & nullable
  httpsProxy: z.string().optional().nullable(), // error in library type – missing optional & nullable
  noProxy: z.string().optional().nullable(), // error in library type – missing optional & nullable
  name: z.string().optional().nullable(), // error in library type – missing optional & nullable
  labels: z.array(z.string()).optional().nullable(), // error in library type – missing optional & nullable
  experimentalBuild: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  serverVersion: z.string().optional().nullable(), // error in library type – missing optional & nullable
  clusterStore: z.string().optional().nullable(), // error in library type – missing optional & nullable
  clusterAdvertise: z.string().optional().nullable(), // error in library type – missing optional & nullable
  defaultRuntime: z.string().optional().nullable(), // error in library type – missing optional & nullable
  liveRestoreEnabled: z.boolean().optional().nullable(), // error in library type – missing optional & nullable
  isolation: z.string().optional().nullable(), // error in library type – missing optional & nullable
  initBinary: z.string().optional().nullable(), // error in library type – missing optional & nullable
  productLicense: z.string().optional().nullable() // error in library type – missing optional & nullable
});

// @ts-ignore
export const DockerImageDataSchema: z.ZodType<DockerImageData> = z.strictObject({
  id: z.string(),
  container: z.string(),
  comment: z.string(),
  os: z.string(),
  architecture: z.string(),
  parent: z.string(),
  dockerVersion: z.string(),
  size: z.number(),
  sharedSize: z.number(),
  virtualSize: z.number(),
  author: z.string(),
  created: z.number(),
  containerConfig: z.any(),
  graphDriver: z.unknown(),
  repoDigests: z.unknown(),
  repoTags: z.unknown(),
  config: z.unknown(),
  rootFS: z.unknown()
}).transform(schema => <DockerImageData>({
  ...schema,
  containerConfig: schema.containerConfig,
  graphDriver: schema.graphDriver,
  repoDigests: schema.repoDigests,
  repoTags: schema.repoTags,
  config: schema.config,
  rootFS: schema.rootFS
})) as z.ZodType<DockerImageData>;

// @ts-ignore
export const DockerContainerMountDataSchema: z.ZodType<DockerContainerMountData> = z.strictObject({
  Type: z.string(),
  Source: z.string(),
  Destination: z.string(),
  Mode: z.string(),
  RW: z.boolean(),
  Propagation: z.string()
});

// @ts-ignore
export const DockerContainerDataSchema: z.ZodType<DockerContainerData> = z.strictObject({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  imageID: z.string(),
  command: z.string(),
  created: z.number(),
  started: z.number(),
  finished: z.number(),
  createdAt: z.string(),
  startedAt: z.string(),
  finishedAt: z.string(),
  state: z.string(),
  restartCount: z.number(),
  platform: z.string(),
  driver: z.string(),
  ports: z.number().array(),
  mounts: DockerContainerMountDataSchema.array()
});

// @ts–ignore
export const DockerContainerStatsDataSchema: z.ZodType<DockerContainerStatsData> = z.strictObject({
  id: z.string(),
  memUsage: z.number(),
  memLimit: z.number(),
  memPercent: z.number(),
  cpuPercent: z.number(),
  pids: z.number(),
  netIO: z.strictObject({
    rx: z.number(),
    wx: z.number()
  }),
  blockIO: z.strictObject({
    r: z.number(),
    w: z.number()
  }),
  restartCount: z.number(),
  cpuStats: z.any(),
  precpuStats: z.any(),
  memoryStats: z.any(),
  networks: z.any()
}).transform(schema => <DockerContainerStatsData>({
  ...schema,
  cpuStats: schema.cpuStats,
  precpuStats: schema.precpuStats,
  memoryStats: schema.memoryStats,
  networks: schema.networks
})) as z.ZodType<DockerContainerStatsData>;

// @ts-ignore
export const DockerContainerProcessDataSchema: z.ZodType<DockerContainerProcessData> = z.strictObject({
  pidHost: z.string(),
  ppid: z.string(),
  pgid: z.string(),
  user: z.string(),
  ruser: z.string(),
  group: z.string(),
  rgroup: z.string(),
  stat: z.string(),
  time: z.string(),
  elapsed: z.string(),
  nice: z.string(),
  rss: z.string(),
  vsz: z.string(),
  command: z.string()
});

// @ts-ignore
export const DockerVolumeDataSchema: z.ZodType<DockerVolumeData> = z.strictObject({
  name: z.string(),
  driver: z.string(),
  labels: z.any(),
  mountpoint: z.string(),
  options: z.any(),
  scope: z.string(),
  created: z.number()
}).transform(schema => <DockerVolumeData>({
  ...schema,
  labels: schema.labels,
  options: schema.options
})) as z.ZodType<DockerVolumeData>;

// 9. Virtual Box

// @ts-ignore
export const VboxInfoDataSchema: z.ZodType<VboxInfoData> = z.strictObject({
  id: z.string(),
  name: z.string(),
  running: z.boolean(),
  started: z.string(),
  runningSince: z.number(),
  stopped: z.string(),
  stoppedSince: z.number(),
  guestOS: z.string(),
  hardwareUUID: z.string(),
  memory: z.number(),
  vram: z.number(),
  cpus: z.number(),
  cpuExepCap: z.string(),
  cpuProfile: z.string(),
  chipset: z.string(),
  firmware: z.string(),
  pageFusion: z.boolean(),
  configFile: z.string(),
  snapshotFolder: z.string(),
  logFolder: z.string(),
  hpet: z.boolean(),
  pae: z.boolean(),
  longMode: z.boolean(),
  tripleFaultReset: z.boolean(),
  apic: z.boolean(),
  x2Apic: z.boolean(),
  acpi: z.boolean(),
  ioApic: z.boolean(),
  biosApicMode: z.string(),
  bootMenuMode: z.string(),
  bootDevice1: z.string(),
  bootDevice2: z.string(),
  bootDevice3: z.string(),
  bootDevice4: z.string(),
  timeOffset: z.string(),
  rtc: z.string()
});

// @ts-ignore
export const PrinterDataSchema: z.ZodType<PrinterData> = z.strictObject({
  id: z.number(),
  name: z.string(),
  model: z.string(),
  uri: z.string(),
  uuid: z.string().nullable(), // error in library type – missing nullable
  local: z.boolean(),
  status: z.string(),
  default: z.boolean(),
  shared: z.boolean()
});

// @ts-ignore
export const USBDataSchema: z.ZodType<UsbData> = z.strictObject({
  id: z.union([z.number(), z.string()]),
  bus: z.number().nullable(),
  deviceId: z.number().nullable(),
  name: z.string(),
  type: z.string(),
  removable: z.boolean(),
  vendor: z.string().nullable(),
  manufacturer: z.string().nullable(),
  maxPower: z.string().nullable(),
  serialNumber: z.string().nullable()
});

// @ts-ignore
export const AudioDataSchema: z.ZodType<AudioData> = z.strictObject({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  manufacturer: z.string(),
  default: z.boolean(),
  revision: z.string().nullable(), // error in library type – missing nullable
  driver: z.string().nullable(), // error in library type – missing nullable
  channel: z.string(),
  in: z.boolean(),
  out: z.boolean(),
  type: z.string(),
  status: z.string()
});

// @ts-ignore
export const BluetoothDeviceDataSchema: z.ZodType<BluetoothDeviceData> = z.strictObject({
  device: z.string(),
  name: z.string(),
  macDevice: z.string(),
  macHost: z.string(),
  batteryPercent: z.number().nullable(), // error in library type – missing nullable
  manufacturer: z.string(),
  type: z.string(),
  connected: z.boolean()
});

// 10. “Get All at once” – functions

// @ts-ignore
export const StaticDataSchema: z.ZodType<StaticData> = z.strictObject({
  version: z.string(),
  system: SystemDataSchema,
  bios: BiosDataSchema,
  baseboard: BaseboardDataSchema,
  chassis: ChassisDataSchema,
  os: OSDataSchema,
  uuid: UUIDDataSchema,
  versions: VersionDataSchema,
  cpu: CPUDataSchema,
  graphics: GraphicsDataSchema,
  net: NetworkInterfacesDataSchema.array(),
  memLayout: MemLayoutDataSchema.array(),
  diskLayout: DiskLayoutDataSchema.array()
});

// @ts-ignore
export const DynamicDataSchema: z.ZodType<DynamicData> = z.strictObject({
  time: TimeDataSchema,
  node: z.string(),
  v8: z.string(),
  cpuCurrentSpeed: CPUCurrentSpeedDataSchema,
  users: UserDataSchema.array(),
  processes: ProcessesDataSchema,
  currentLoad: CurrentLoadDataSchema,
  cpuTemperature: CPUTemperatureDataSchema,
  networkStats: NetworkStatsDataSchema,
  networkConnections: NetworkConnectionsDataSchema,
  mem: MemDataSchema,
  battery: BatteryDataSchema,
  services: ServicesDataSchema,
  fsSize: FSSizeDataSchema,
  fsStats: FSStatsDataSchema,
  disksIO: DisksIODataSchema,
  wifiNetworks: WifiNetworkDataSchema,
  inetLatency: z.number()
});

export const GeneralSchema = z.strictObject({
  version: z.string(),
  time: TimeDataSchema,
  type: z.literal("general")
});

export type General = z.infer<typeof GeneralSchema>

export const SystemSchema = z.strictObject({
  system: SystemDataSchema,
  bios: BiosDataSchema,
  baseboard: BaseboardDataSchema,
  chassis: ChassisDataSchema,
  type: z.literal("system")
});

export type System = z.infer<typeof SystemSchema>

export const CPUSchema = z.strictObject({
  cpu: CPUDataSchema,
  flags: z.string(),
  cache: CPUCacheDataSchema,
  currentSpeed: CPUCurrentSpeedDataSchema,
  temperature: CPUTemperatureDataSchema,
  type: z.literal("cpu")
});

export type CPU = z.infer<typeof CPUSchema>

export const MemorySchema = z.strictObject({
  memory: MemDataSchema,
  layout: MemLayoutDataSchema.array(),
  type: z.literal("memory")
});

export type Memory = z.infer<typeof MemorySchema>

export const BatterySchema = z.strictObject({
  battery: BatteryDataSchema,
  type: z.literal("battery")
});

export type Battery = z.infer<typeof BatterySchema>

export const GraphicsSchema = z.strictObject({
  graphics: GraphicsDataSchema,
  type: z.literal("graphics")
});

export type Graphics = z.infer<typeof GraphicsSchema>

export const OSSchema = z.strictObject({
  os: OSDataSchema,
  uuid: UUIDDataSchema,
  versions: VersionDataSchema,
  shell: z.string(),
  users: UserDataSchema.array(),
  type: z.literal("os")
});

export type OS = z.infer<typeof OSSchema>

export const ProcessesSchema = z.strictObject({
  currentLoad: CurrentLoadDataSchema,
  fullLoad: z.number(),
  processes: ProcessesDataSchema,
  services: ServicesDataSchema.array(),
  processLoad: ProcessesProcessLoadDataSchema.array(),
  type: z.literal("processes")
});

export type Processes = z.infer<typeof ProcessesSchema>

export const FSSchema = z.strictObject({
  diskLayout: DiskLayoutDataSchema.array(),
  blockDevices: BlockDevicesDataSchema.array(),
  disksIO: DisksIODataSchema,
  fsSize: FSSizeDataSchema.array(),
  fsOpenFiles: z.union([FSOpenFilesDataSchema, FSOpenFilesDataSchema.array()]), // error in library type – missing singleton as possible union type
  fsStats: FSStatsDataSchema,
  type: z.literal("fs")
});

export type FS = z.infer<typeof FSSchema>

export const USBSchema = z.strictObject({
  usb: USBDataSchema.array(),
  type: z.literal("usb")
});

export type USB = z.infer<typeof USBSchema>

export const PrinterSchema = z.strictObject({
  printer: PrinterDataSchema.array(),
  type: z.literal("printer")
});

export type Printer = z.infer<typeof PrinterSchema>

export const AudioSchema = z.strictObject({
  audio: AudioDataSchema.array(),
  type: z.literal("audio")
});

export type Audio = z.infer<typeof AudioSchema>

export const NetworkSchema = z.strictObject({
  interfaces: z.union([NetworkInterfacesDataSchema, NetworkInterfacesDataSchema.array()]),
  interfaceDefault: z.string(),
  gatewayDefault: z.string(),
  stats: NetworkStatsDataSchema.array(),
  connections: NetworkConnectionsDataSchema.array(),
  inetChecksite: InetChecksiteDataSchema,
  inetLatency: z.number(),
  type: z.literal("network")
});

export type Network = z.infer<typeof NetworkSchema>

export const WifiSchema = z.strictObject({
  networks: WifiNetworkDataSchema.array(),
  interfaces: WifiInterfaceDataSchema.array(),
  connections: WifiConnectionDataSchema.array(),
  type: z.literal("wifi")
});

export type Wifi = z.infer<typeof WifiSchema>

export const BluetoothSchema = z.strictObject({
  devices: BluetoothDeviceDataSchema.array(),
  type: z.literal("bluetooth")
});

export type Bluetooth = z.infer<typeof BluetoothSchema>

export const DockerSchema = z.strictObject({
  docker: DockerInfoDataSchema,
  images: DockerImageDataSchema.array(),
  containers: DockerContainerDataSchema.array(),
  containerStats: DockerContainerStatsDataSchema.array(),
  containerProcesses: DockerContainerProcessDataSchema.array(),
  volumes: DockerVolumeDataSchema.array(),
  type: z.literal("docker")
});

export type Docker = z.infer<typeof DockerSchema>

export const VboxSchema = z.strictObject({
  vbox: VboxInfoDataSchema.array(),
  type: z.literal("vbox")
});

export type Vbox = z.infer<typeof VboxSchema>

export const MDCSchema = z.strictObject({
  power: z.string(),
  volume: z.string(),
  source: z.string(),
  isMuted: z.string(),
  model: z.string()
});

export const PJLinkSchema = z.strictObject({
  info: z.string(),
  source: z.string(),
  power: z.string(),
  pjlinkClass: z.string(),
  isMuted: z.string(),
  errors: z.string(),
  lamp: z.string(),
  name: z.string(),
  manufacturer: z.string(),
  product: z.string(),
  sources: z.string()
});

export const BrowserSchema = z.strictObject({
  displayId: z.number(),
  url: z.string(),
  windowId: z.string()
});