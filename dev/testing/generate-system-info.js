import * as si from "systeminformation";
import { default as files } from "node:fs";
import path from "node:path";

const general = () =>
  ({ version: si.version(), time: si.time(), type: "general" });

const system = async () => ({
  system: await si.system(),
  bios: await si.bios(),
  baseboard: await si.baseboard(),
  chassis: await si.chassis(),
  type: "system"
});

const cpu = async () => ({
  cpu: await si.cpu(),
  flags: await si.cpuFlags(),
  cache: await si.cpuCache(),
  currentSpeed: await si.cpuCurrentSpeed(),
  temperature: await si.cpuTemperature(),
  type: "cpu"
});

const memory = async () => ({
  memory: await si.mem(),
  layout: await si.memLayout(),
  type: "memory"
});

const battery = async () => ({
  battery: await si.battery(),
  type: "battery"
});

const graphics = async () => ({
  graphics: await si.graphics(),
  type: "graphics"
});

const os = async () => ({
  os: await si.osInfo(),
  uuid: await si.uuid(),
  versions: await si.versions(),
  shell: await si.shell(),
  users: await si.users(),
  type: "os"
});

const processes = async () => {
  const processes = await si.processes();
  const services = await si.services(processes
    .list
    .map(x => x.name)
    .join(","));
  const processLoad = await si.processLoad(processes
    .list
    .map(x => x.name)
    .join(","));
  return ({
    currentLoad: await si.currentLoad(),
    fullLoad: await si.fullLoad(),
    processes: processes,
    services: services,
    processLoad: processLoad,
    type: "processes"
  });
};

const fs = async () => ({
  diskLayout: await si.diskLayout(),
  blockDevices: await si.blockDevices(),
  disksIO: await si.disksIO(),
  fsSize: await si.fsSize(),
  fsOpenFiles: await si.fsOpenFiles(),
  fsStats: await si.fsStats(),
  type: "fs"
});

const usb = async () => ({
  usb: await si.usb(),
  type: "usb"
});

const printer = async () => ({
  printer: await si.printer(),
  type: "printer"
});

const audio = async () => ({
  audio: await si.audio(),
  type: "audio"
});

const network = async () => ({
  interfaces: await si.networkInterfaces(),
  interfaceDefault: await si.networkInterfaceDefault(),
  gatewayDefault: await si.networkGatewayDefault(),
  stats: await si.networkStats(),
  connections: await si.networkConnections(),
  inetChecksite: await si.inetChecksite("https://www.google.com"),
  inetLatency: await si.inetLatency(),
  type: "network"
});

const wifi = async () => ({
  networks: await si.wifiNetworks(),
  interfaces: await si.wifiInterfaces(),
  connections: await si.wifiConnections(),
  type: "wifi"
});

const bluetooth = async () => ({
  devices: await si.bluetoothDevices(),
  type: "bluetooth"
});

const docker = async () => {
  const containers = await si.dockerContainers();
  return ({
    docker: await si.dockerInfo(),
    images: await si.dockerImages(),
    containers,
    containerStats: await si.dockerContainerStats(),
    containerProcesses: await Promise.all(containers.flatMap(async container =>
      (await si.dockerContainerProcesses(container.id))
        .map(process => ({ id: container.id, ...process })))),
    volumes: await si.dockerVolumes(),
    type: "docker"
  });
};

const vbox = async () => ({
  vbox: await si.vboxInfo(),
  type: "vbox"
});

const data = {
  general: general(),
  mdc: {
    power: "on",
    volume: 78,
    isMuted: true,
    source: "DP"
  },
  pjlink: {
    product: "Projector",
    sources: "SOURCES",
    isVideoMuted: true,
    lamp: "LAMP DETAILS",
    source: "VIDEO",
    manufacturer: "EXAMPLE",
    isAudioMuted: true,
    name: "Projector - EXAMPLE",
    power: "off",
    pjlinkClass: "PJLINK CLASS",
    isMuted: true,
    errors: "",
    info: "INFO"
  },
  system: await system(),
  cpu: await cpu(),
  memory: await memory(),
  battery: await battery(),
  graphics: await graphics(),
  os: await os(),
  processes: await processes(),
  fs: await fs(),
  usb: await usb(),
  printer: await printer(),
  audio: await audio(),
  network: await network(),
  wifi: await wifi(),
  bluetooth: await bluetooth(),
  docker: await docker(),
  vbox: await vbox()
};

files.writeFileSync(path.join(import.meta.dirname, "data", "system-info.json"), JSON.stringify(data, undefined, 2))
