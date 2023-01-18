import { DeviceResult, DeviceService } from "../utils/types";
import { getStatus } from "./features/mdc";

const reboot = async (): Promise<DeviceResult> => {
  // TODO: implement
  return {error: "Not Implemented"};
};

const shutdown = async (): Promise<DeviceResult> => {
  // TODO: implement
  return {error: "Not Implemented"};
};

const start = async (): Promise<DeviceResult> => {
  // TODO: implement
  return {};
};

const info = async (): Promise<DeviceResult> => ({});

const status = async (ip: string, port: number): Promise<DeviceResult> => {
  getStatus(0x01, ip, port);
  return {};
};

const execute = async (): Promise<DeviceResult> => {
  return {error: "Not Implemented"};
};

const screenshot = async (): Promise<DeviceResult> => {
  return {error: "Not Implemented"};
};

const openBrowser = async (): Promise<DeviceResult> => {
  return {error: "Not Implemented"};
};

const getBrowserStatus = async (): Promise<DeviceResult> => {
  return {error: "Not Implemented"};
};

const closeBrowser = async (): Promise<DeviceResult> => {
  return {error: "Not Implemented"};
};

const MDCService: DeviceService = {
  reboot,
  shutdown,
  start,
  info,
  status,
  execute,
  screenshot,
  openBrowser,
  getBrowserStatus,
  closeBrowser
};

export default MDCService;
