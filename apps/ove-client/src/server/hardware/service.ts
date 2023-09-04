import SystemInfo from "./features/system-info";
import SystemControl from "./features/system-control";
import BrowserControl from "./features/browser-control";

const getInfo = async (type?: string) => {
  switch (type) {
    case "system":
      return await SystemInfo.system();
    case "cpu":
      return await SystemInfo.cpu();
    case "memory":
      return await SystemInfo.memory();
    case "battery":
      return await SystemInfo.battery();
    case "graphics":
      return await SystemInfo.graphics();
    case "os":
      return await SystemInfo.os();
    case "processes":
      return await SystemInfo.processes();
    case "fs":
      return await SystemInfo.fs();
    case "usb":
      return await SystemInfo.usb();
    case "printer":
      return await SystemInfo.printer();
    case "audio":
      return await SystemInfo.audio();
    case "network":
      return await SystemInfo.network();
    case "wifi":
      return await SystemInfo.wifi();
    case "bluetooth":
      return await SystemInfo.bluetooth();
    case "docker":
      return await SystemInfo.docker();
    case "vbox":
      return await SystemInfo.vbox();
    default:
      return SystemInfo.general();
  }
};

export default {
  getInfo,
  ...SystemControl,
  ...BrowserControl
};
