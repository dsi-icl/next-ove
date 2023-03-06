// noinspection DuplicatedCode

import { DeviceService } from "../utils/types";

const reboot = async () => {
  // TODO: implement
  throw new Error();
};

const shutdown = async () => {
  // TODO: implement
  throw new Error();
};

const start = async () => {
  // TODO: implement
  throw new Error();
};

const info = async () => {
  throw new Error();
};

const status = async () => {
  // TODO: implement
  throw new Error();
};

const execute = async () => {
  // TODO: implement
  throw new Error();
};

const screenshot = async () => {
  // TODO: implement
  throw new Error();
};

const openBrowser = async () => {
  // TODO: implement
  throw new Error();
};

const getBrowserStatus = async () => {
  // TODO: implement
  throw new Error();
};

const closeBrowser = async () => {
  // TODO: implement
  throw new Error();
};

const closeBrowsers = async () => {
  throw new Error();
};

const getBrowsers = async () => {
  throw new Error();
};

const setVolume = async () => {
  throw new Error();
};

const setSource = async () => {
  throw new Error();
};

const mute = async () => {
  throw new Error();
};

const unmute = async () => {
  throw new Error();
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
  getBrowsers,
  setVolume,
  setSource,
  mute,
  unmute
};

export default ProjectorService;
