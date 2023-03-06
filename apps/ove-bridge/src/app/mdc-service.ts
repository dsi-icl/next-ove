// noinspection DuplicatedCode

import { DeviceService, MDCSource } from "../utils/types";
import * as service from "./features/mdc";
import { Device, MDCInfo } from "@ove/ove-types";

const reboot = async ({ ip, port }: Device): Promise<string> => {
  await service.setPower(0x01, ip, port, "off");
  return await new Promise(resolve => setTimeout(async () => resolve(await service.setPower(0x01, ip, port, "on")), 1000));
};

const shutdown = async ({ ip, port }: Device) => await service.setPower(0x01, ip, port, "off");

const start = async ({ ip, port }: Device) => await service.setPower(0x01, ip, port, "on");

const info = async ({ ip, port }: Device): Promise<MDCInfo> => {
  const power = await service.getPower(0x01, ip, port);
  const volume = await service.getVolume(0x01, ip, port);
  const source = await service.getSource(0x01, ip, port);
  const isMuted = await service.getIsMute(0x01, ip, port);
  const model = await service.getModel(0x01, ip, port);

  return {
    power,
    volume,
    source,
    isMuted,
    model
  };
};

const status = async ({ ip, port }: Device) => {
  const status = await service.getStatus(0x01, ip, port);
  return { status };
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

const mute = async ({ip, port}: Device) => await service.setIsMute(0x01, ip, port, true);

const unmute = async ({ip, port}: Device) => await service.setIsMute(0x01, ip, port, false);

const setVolume = async ({ip, port}: Device, volume: number) => await service.setVolume(0x01, ip, port, volume);

const setSource = async ({ip, port}: Device, source: keyof MDCSource) => await service.setSource(0x01, ip, port, source);

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
  getBrowsers,
  mute,
  unmute,
  setVolume,
  setSource,
};

export default MDCService;
