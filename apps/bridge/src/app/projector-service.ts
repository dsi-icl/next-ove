import { DeviceResult, DeviceService } from "../utils/types";

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
  return {error: "Not Implemented"};
};

const info = async (): Promise<DeviceResult> => ({});

const status = async (): Promise<DeviceResult> => {
  // TODO: implement
  return {error: "Not Implemented"};
};

const execute = async (): Promise<DeviceResult> => {
  // TODO: implement
  return {error: "Not Implemented"};
};

const screenshot = async (): Promise<DeviceResult> => {
  // TODO: implement
  return {error: "Not Implemented"};
};

const openBrowser = async (): Promise<DeviceResult> => {
  // TODO: implement
  return {error: "Not Implemented"};
};

const getBrowserStatus = async (): Promise<DeviceResult> => {
  // TODO: implement
  return {error: "Not Implemented"};
};

const closeBrowser = async (): Promise<DeviceResult> => {
  // TODO: implement
  return {error: "Not Implemented"};
};

const closeBrowsers = async (): Promise<DeviceResult> => {
  return {error: "Not Implemented"}
};

const getDisplays = async (): Promise<DeviceResult> => {
  return {error: "Not Implemented"};
};

const getBrowsers = async (): Promise<DeviceResult> => {
  return {error: "Not Implemented"};
};

const ProjectorService: DeviceService = {
  reboot,
  shutdown,
  start,
  info,
  status,
  execute,
  screenshot,
  openBrowser,
  getBrowserStatus,
  closeBrowser,
  closeBrowsers,
  getDisplays,
  getBrowsers
};

export default ProjectorService;
