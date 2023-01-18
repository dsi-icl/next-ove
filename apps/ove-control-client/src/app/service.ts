import si from "./features/system-info";
import sc from "./features/system-control";
import bc from "./features/browser-control";

const SystemInfo = si();
const SystemControl = sc();
const BrowserControl = bc();

export const getStatus = () => ({status: "running"});

export const getInfoGeneral = SystemInfo.general;
export const getInfoSystem = SystemInfo.system;
export const getInfoCPU = SystemInfo.cpu;
export const getInfoMemory = SystemInfo.memory;
export const getInfoBattery = SystemInfo.battery;
export const getInfoGraphics = SystemInfo.graphics;
export const getInfoOS = SystemInfo.fs;
export const getInfoProcesses = SystemInfo.processes;
export const getInfoFS = SystemInfo.fs;
export const getInfoUSB = SystemInfo.usb;
export const getInfoPrinter = SystemInfo.printer;
export const getInfoAudio = SystemInfo.audio;
export const getInfoNetwork = SystemInfo.network;
export const getInfoWifi = SystemInfo.wifi;
export const getInfoBluetooth = SystemInfo.bluetooth;
export const getInfoDocker = SystemInfo.docker;
export const shutdown = SystemControl.shutdown;
export const reboot = SystemControl.reboot;
export const execute = SystemControl.execute;
export const screenshot = SystemControl.screenshot;
export const openBrowser = BrowserControl.openBrowser;
export const getBrowserStatus = BrowserControl.getBrowserStatus;
export const closeBrowser = BrowserControl.closeBrowser;
export const getBrowsers = BrowserControl.getBrowsers;
export const closeBrowsers = BrowserControl.closeBrowsers;

const getInfo = async (type: string): Promise<object> => {
  switch (type) {
    case "system":
      return await getInfoSystem();
    case "cpu":
      return await getInfoCPU();
    case "memory":
      return await getInfoMemory();
    case "battery":
      return await getInfoBattery();
    case "graphics":
      return await getInfoGraphics();
    case "os":
      return await getInfoOS();
    case "processes":
      return await getInfoProcesses();
    case "fs":
      return await getInfoFS();
    case "usb":
      return await getInfoUSB();
    case "printer":
      return await getInfoPrinter();
    case "audio":
      return await getInfoAudio();
    case "network":
      return await getInfoNetwork();
    case "wifi":
      return await getInfoWifi();
    case "bluetooth":
      return await getInfoBluetooth();
    case "docker":
      return await getInfoDocker();
    default:
      return getInfoGeneral();
  }
}

export default () => ({
  getStatus,
  getInfo,
  getBrowserStatus,
  getBrowsers
});
