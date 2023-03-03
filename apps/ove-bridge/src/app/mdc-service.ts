// noinspection DuplicatedCode

import { DeviceService } from "../utils/types";
import * as service from "./features/mdc";
import { Device } from "@ove/ove-types";

const reboot = async () => {
  // TODO: implement
  throw new Error();
};

const shutdown = async ({ip, port}: Device) => await service.setPower(0x01, ip, port, "off");

const start = async ({ip, port}: Device) => await service.setPower(0x01, ip, port, "on");

const info = async ({ip, port}: Device) => {
  const power = await service.getPower(0x01, ip, port);
  const volume = await service.getVolume(0x01, ip, port);

  return {
    power,
    volume
  };
};

const status = async ({ip, port}: Device) => {
  const status = await service.getStatus(0x01, ip, port);
  return {status};
};

const execute = async () => {
  throw new Error();
};

const screenshot = async () => {
  throw new Error();
};

const openBrowser = async () => {
  throw new Error();
};

const getBrowserStatus = async () => {
  throw new Error();
};

const closeBrowser = async () => {
  throw new Error();
};

const closeBrowsers = async () => {
  throw new Error();
};

const getBrowsers = async () => {
  throw new Error();
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
  closeBrowser,
  closeBrowsers,
  getBrowsers
};

export default MDCService;
