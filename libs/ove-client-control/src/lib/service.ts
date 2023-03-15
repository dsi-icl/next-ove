import si from "./system-info";
import sc from "./system-control";
import bc from "./browser-control";
import { NodeInfoSchema, Response } from "@ove/ove-types";
import {z} from "zod";

const SystemInfo = si();
const SystemControl = sc();
const BrowserControl = bc();

const getInfo = async (type?: string): Promise<z.infer<typeof NodeInfoSchema>> => {
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
}
const getStatus = (): Response => ({response: "running"});
const getWelcome = (): {message: string} => ({ message: "Welcome to control-client!" });

const reboot = SystemControl.reboot;
const execute = SystemControl.execute;
const shutdown = SystemControl.shutdown;
const screenshot = BrowserControl.screenshot;
const openBrowser = BrowserControl.openBrowser;

const closeBrowser = BrowserControl.closeBrowser;
const closeBrowsers = BrowserControl.closeBrowsers;

const init = BrowserControl.init;

export default () => ({
  init,
  getWelcome,
  getStatus,
  getInfo,
  shutdown,
  reboot,
  execute,
  screenshot,
  openBrowser,
  closeBrowsers,
  closeBrowser
});
