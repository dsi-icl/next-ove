import * as si from "systeminformation";
import { SystemInfo } from "./types";

const general = () => ({ version: si.version(), time: si.time(), type: "general" as const });

const system = async () => ({
  system: await si.system(),
  bios: await si.bios(),
  baseboard: await si.baseboard(),
  chassis: await si.chassis(),
  type: "system" as const
});

const cpu = async () => ({
  cpu: await si.cpu(),
  flags: await si.cpuFlags(),
  cache: await si.cpuCache(),
  currentSpeed: await si.cpuCurrentSpeed(),
  temperature: await si.cpuTemperature(),
  type: "cpu" as const
});

const memory = async () => ({
  memory: await si.mem(),
  layout: await si.memLayout(),
  type: "memory" as const
});

const battery = async () => ({
  battery: await si.battery(),
  type: "battery" as const
});

const graphics = async () => ({
  graphics: await si.graphics(),
  type: "graphics" as const
});

const os = async () => ({
  os: await si.osInfo(),
  uuid: await si.uuid(),
  versions: await si.versions(),
  shell: await si.shell(),
  users: await si.users(),
  type: "os" as const
});

const processes = async () => ({
  currentLoad: await si.currentLoad(),
  fullLoad: await si.fullLoad(),
  processes: await si.processes(),
  type: "processes" as const
});

const fs = async () => ({
  diskLayout: await si.diskLayout(),
  blockDevices: await si.blockDevices(),
  disksIO: await si.disksIO(),
  fsSize: await si.fsSize(),
  fsOpenFiles: await si.fsOpenFiles(),
  fsStats: await si.fsStats(),
  type: "fs" as const
});

const usb = async () => ({
  usb: await si.usb(),
  type: "usb" as const
});

const printer = async () => ({
  printer: await si.printer(),
  type: "printer" as const
});

const audio = async () => ({
  audio: await si.audio(),
  type: "audio" as const
});

const network = async () => ({
  interfaces: await si.networkInterfaces(),
  interfaceDefault: await si.networkInterfaceDefault(),
  gatewayDefault: await si.networkGatewayDefault(),
  stats: await si.networkStats(),
  connections: await si.networkConnections(),
  inetChecksite: await si.inetChecksite("www.google.com"),
  inetLatency: await si.inetLatency(),
  type: "network" as const
});

const wifi = async () => ({
  networks: await si.wifiNetworks(),
  interfaces: await si.wifiInterfaces(),
  connections: await si.wifiConnections(),
  type: "wifi" as const
});

const bluetooth = async () => ({
  devices: await si.bluetoothDevices(),
  type: "bluetooth" as const
});

const docker = async () => ({
  docker: await si.dockerInfo(),
  images: await si.dockerImages(),
  containers: await si.dockerContainers(),
  containerStats: await si.dockerContainerStats(),
  containerProcesses: await si.dockerContainerProcesses(),
  volumes: await si.dockerVolumes(),
  type: "docker" as const
});

export default (): SystemInfo => ({
  general,
  system,
  cpu,
  memory,
  battery,
  graphics,
  os,
  processes,
  fs,
  usb,
  printer,
  audio,
  network,
  wifi,
  bluetooth,
  docker
});
