/* global setTimeout */

import {
  type Device,
  type TBridgeHardwareService,
  type TBridgeServiceArgs,
  MDCSourceSchema, isError, OVEException
} from "@ove/ove-types";
import { z } from "zod";
import * as mdc from "@ove/mdc-control";
import { raise } from "@ove/ove-utils";

const reboot = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"reboot">
) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setPower(0x01, ip, port, "off");

  if (isError(res)) return res;
  return new Promise<boolean | OVEException>(resolve =>
    setTimeout(() => {
      mdc.setPower(0x01, ip, port, "on").then(res => resolve(isError(res) ? res : true));
    }, 1000)
  );
};

const shutdown = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"shutdown">
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setPower(0x01, ip, port, "off");
  return isError(res) ? res : true;
};

const start = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"start">
) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setPower(0x01, ip, port, "on");
  return isError(res) ? res : true;
};

const getInfo = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"getInfo">
) => {
  const infoOptsSchema = z.object({}).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const power = await mdc.getPower(0x01, ip, port);
  const volume = await mdc.getVolume(0x01, ip, port);
  const source = await mdc.getSource(0x01, ip, port);
  const isMuted = await mdc.getIsMute(0x01, ip, port);
  const model = await mdc.getModel(0x01, ip, port);

  if (isError(power) || isError(volume) || isError(source) || isError(isMuted) || isError(model)) {
    return raise("MDC ERROR");
  }

  return {
    power,
    volume,
    source,
    isMuted,
    model
  };
};

const getStatus = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"getStatus">
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.getStatus(0x01, ip, port);
  return isError(res) ? res : true;
};

const mute = async ({ ip, port }: Device, args: TBridgeServiceArgs<"mute">) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setIsMute(0x01, ip, port, true);
  return isError(res) ? res : true;
};

const unmute = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"unmute">
) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setIsMute(0x01, ip, port, false);
  return isError(res) ? res : true;
};

const setVolume = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"setVolume">
) => {
  const setVolumeOptsSchema = z.object({ volume: z.number() }).strict();
  const parsedOpts = setVolumeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setVolume(0x01, ip, port, parsedOpts.data.volume);
  return isError(res) ? res : true;
};

const setSource = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"setSource">
) => {
  const setSourceOptsSchema = z
    .object({ source: MDCSourceSchema.keyof() })
    .strict();
  const parsedOpts = setSourceOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setSource(0x01, ip, port, mdc.sources[parsedOpts.data.source]);
  return isError(res) ? res : true;
};

const MDCService: TBridgeHardwareService = {
  reboot,
  shutdown,
  start,
  getInfo,
  getStatus,
  mute,
  unmute,
  setVolume,
  setSource
};
export default MDCService;
