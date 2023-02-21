import * as si from "systeminformation";
import { Display, SystemInfo } from "../types";
import * as screenshot from "screenshot-desktop";

const general = () => ({ "version": si.version(), "time": si.time() });

const getDisplays = async (): Promise<Display[]> => {
  return await screenshot.listDisplays();
};

const system = async () => ({
  "general": await si.system(),
  "bios": await si.bios(),
  "baseboard": await si.baseboard(),
  "chassis": await si.chassis()
});

const cpu = async () => ({
  "general": await si.cpu(),
  "flags": await si.cpuFlags(),
  "cache": await si.cpuCache(),
  "currentSpeed": await si.cpuCurrentSpeed(),
  "temperature": await si.cpuTemperature()
});

const memory = async () => ({
  "general": await si.mem(),
  "layout": await si.memLayout()
});

const battery = async () => ({
  "general": await si.battery()
});

const graphics = async () => ({
  "general": await si.graphics()
});

const os = async () => ({
  "general": await si.osInfo(),
  "uuid": await si.uuid(),
  "versions": await si.versions(),
  "shell": await si.shell(),
  "users": await si.users()
});

const processes = async () => ({
  "currentLoad": await si.currentLoad(),
  "fullLoad": await si.fullLoad(),
  "processes": await si.processes()
});

const fs = async () => ({
  "diskLayout": await si.diskLayout(),
  "blockDevices": await si.blockDevices(),
  "disksIO": await si.disksIO(),
  "fsSize": await si.fsSize(),
  "fsOpenFiles": await si.fsOpenFiles(),
  "fsStats": await si.fsStats()
});

const usb = async () => ({
  "general": await si.usb()
});

const printer = async () => ({
  "general": await si.printer()
});

const audio = async () => ({
  "general": await si.audio()
});

const network = async () => ({
  "interfaces": await si.networkInterfaces(),
  "interfaceDefault": await si.networkInterfaceDefault(),
  "gatewayDefault": await si.networkGatewayDefault(),
  "stats": await si.networkStats(),
  "connections": await si.networkConnections(),
  "inetChecksite": await si.inetChecksite("www.google.com"),
  "inetLatency": await si.inetLatency()
});

const wifi = async () => ({
  "networks": await si.wifiNetworks(),
  "interfaces": await si.wifiInterfaces(),
  "connections": await si.wifiConnections()
});

const bluetooth = async () => ({
  "devices": await si.bluetoothDevices()
});

const docker = async () => ({
  "general": await si.dockerInfo(),
  "images": await si.dockerImages(),
  "containers": await si.dockerContainers(),
  "containerStats": await si.dockerContainerStats(),
  "containerProcesses": await si.dockerContainerProcesses(),
  "volumes": await si.dockerVolumes()
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
  docker,
  getDisplays
});
