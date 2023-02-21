import si from "./features/system-info";
import sc from "./features/system-control";
import bc from "./features/browser-control";

const SystemInfo = si();
const SystemControl = sc();
const BrowserControl = bc();

const getDisplays = SystemInfo.getDisplays;
const getBrowsers = BrowserControl.getBrowsers;
const getBrowserStatus = BrowserControl.getBrowserStatus;
const getInfo = async (type?: string): Promise<object> => {
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
    default:
      return SystemInfo.general();
  }
}
const getStatus = (): {status: string} => ({status: "running"});
const getWelcome = (): {message: string} => ({ message: "Welcome to control-client!" });

const reboot = SystemControl.reboot;
const execute = SystemControl.execute;
const shutdown = SystemControl.shutdown;
const screenshot = BrowserControl.screenshot;
const openBrowser = BrowserControl.openBrowser;

const closeBrowser = BrowserControl.closeBrowser;
const closeBrowsers = BrowserControl.closeBrowsers;

export default () => ({
  getWelcome,
  getStatus,
  getInfo,
  getBrowserStatus,
  getBrowsers,
  shutdown,
  reboot,
  execute,
  screenshot,
  openBrowser,
  getDisplays,
  closeBrowsers,
  closeBrowser
});
