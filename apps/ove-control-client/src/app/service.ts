import * as si from "systeminformation";
import { exec } from "child_process";
import {chromium} from "playwright";
import { IS_LINUX_LIKE, IS_OS_HP_UX, IS_OS_SOLARIS, IS_OS_WINDOWS } from "./os-utils";

const getInfoGeneral = () => ({ "version": si.version(), "time": si.time() });

const getInfoSystem = async () => ({
  "general": await si.system(),
  "bios": await si.bios(),
  "baseboard": await si.baseboard(),
  "chassis": await si.chassis()
});

const getInfoCPU = async () => ({
  "general": await si.cpu(),
  "flags": await si.cpuFlags(),
  "cache": await si.cpuCache(),
  "currentSpeed": await si.cpuCurrentSpeed(),
  "temperature": await si.cpuTemperature()
});

const getInfoMemory = async () => ({
  "general": await si.mem(),
  "layout": await si.memLayout()
});

const getInfoBattery = async () => ({
  "general": await si.battery()
});

const getInfoGraphics = async () => ({
  "general": await si.graphics()
});

const getInfoOS = async () => ({
  "general": await si.osInfo(),
  "uuid": await si.uuid(),
  "versions": await si.versions(),
  "shell": await si.shell(),
  "users": await si.users()
});

const getInfoProcesses = async () => ({
  "currentLoad": await si.currentLoad(),
  "fullLoad": await si.fullLoad(),
  "processes": await si.processes()
});

const getInfoFS = async () => ({
  "diskLayout": await si.diskLayout(),
  "blockDevices": await si.blockDevices(),
  "disksIO": await si.disksIO(),
  "fsSize": await si.fsSize(),
  "fsOpenFiles": await si.fsOpenFiles(),
  "fsStats": await si.fsStats()
});

const getInfoUSB = async () => ({
  "general": await si.usb()
});

const getInfoPrinter = async () => ({
  "general": await si.printer()
});

const getInfoAudio = async () => ({
  "general": await si.audio()
});

const getInfoNetwork = async () => ({
  "interfaces": await si.networkInterfaces(),
  "interfaceDefault": await si.networkInterfaceDefault(),
  "gatewayDefault": await si.networkGatewayDefault(),
  "stats": await si.networkStats(),
  "connections": await si.networkConnections(),
  "inetChecksite": await si.inetChecksite("www.google.com"),
  "inetLatency": await si.inetLatency()
});

const getInfoWifi = async () => ({
  "networks": await si.wifiNetworks(),
  "interfaces": await si.wifiInterfaces(),
  "connections": await si.wifiConnections()
});

const getInfoBluetooth = async () => ({
  "devices": await si.bluetoothDevices()
});

const getInfoDocker = async () => ({
  "general": await si.dockerInfo(),
  "images": await si.dockerImages(),
  "containers": await si.dockerContainers(),
  "containerStats": await si.dockerContainerStats(),
  "containerProcesses": await si.dockerContainerProcesses(),
  "volumes": await si.dockerVolumes()
});

const _handleExecOutput = (err, stdout, stderr) => {
  if (err) {
    console.error(err.message);
    return;
  }
  if (stderr) {
    console.error(stderr);
    return;
  }

  console.log(stdout);
};

const _buildShutdownCommand = () => {
  if (IS_OS_HP_UX) {
    return "shutdown -hy now";
  } else if (IS_OS_SOLARIS) {
    return "shutdown -y -i5 -g0";
  } else if (IS_LINUX_LIKE) {
    return "shutdown -h now";
  } else if (IS_OS_WINDOWS) {
    return "shutdown.exe /s /f";
  } else {
    throw Error("Unknown operating system");
  }
};

const shutdown = () => setTimeout(() => exec(_buildShutdownCommand(), _handleExecOutput), 1000);

const openBrowser = async () => {
  const browser = await chromium.launch({headless: false, channel: 'chrome', args: ['--start-fullscreen']});
  // const context = await browser.newContext({viewport: null});
  const page = await browser.newPage();
  await page.goto("https://www.google.com");
};

const _buildRebootCommand = () => {
  if (IS_OS_HP_UX) {
    return "reboot -h";
  } else if (IS_OS_SOLARIS) {
    return "shutdown -y -i6 -g0";
  } else if (IS_LINUX_LIKE) {
    return "shutdown -r now";
  } else if (IS_OS_WINDOWS) {
    return "shutdown.exe /r /f";
  } else {
    throw Error("Unknown operating system");
  }
};

const reboot = () => setTimeout(() => exec(_buildRebootCommand(), _handleExecOutput), 1000);

export {
  getInfoGeneral,
  getInfoSystem,
  getInfoCPU,
  getInfoMemory,
  getInfoBattery,
  getInfoGraphics,
  getInfoOS,
  getInfoProcesses,
  getInfoFS,
  getInfoUSB,
  getInfoPrinter,
  getInfoAudio,
  getInfoNetwork,
  getInfoWifi,
  getInfoBluetooth,
  getInfoDocker,
  shutdown,
  reboot,
  openBrowser
};
