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
import { env } from "../../../../env";

const reboot = async (
  { ip, port, protocol }: Device,
  args: TBridgeServiceArgs<"reboot">
) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setPower("off", 0x01, ip, port, protocol);

  if (isError(res)) return res;
  return new Promise<boolean | OVEException>(resolve =>
    setTimeout(() => {
      mdc.setPower("on", 0x01, ip, port, protocol)
        .then(res => resolve(isError(res) ? res : true));
    }, env.MDC_RESTART_TIMEOUT)
  );
};

const shutdown = async (
  { ip, port, protocol }: Device,
  args: TBridgeServiceArgs<"shutdown">
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setPower("off", 0x01, ip, port, protocol);
  return isError(res) ? res : true;
};

const start = async (
  { ip, port, protocol }: Device,
  args: TBridgeServiceArgs<"start">
) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setPower("on", 0x01, ip, port, protocol);
  return isError(res) ? res : true;
};

const getInfo = async (
  { ip, port, protocol }: Device,
  args: TBridgeServiceArgs<"getInfo">
) => {
  const infoOptsSchema = z
    .object({ type: z.literal("general").optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const power = await mdc.getPower(env.MDC_TIMEOUT, 0x01, ip, port, protocol);
  const volume = await mdc.getVolume(env.MDC_TIMEOUT, 0x01, ip, port, protocol);
  const source = await mdc
    .getSource(env.MDC_TIMEOUT, 0x01, ip, port, protocol);
  const isMuted = await mdc
    .getIsMute(env.MDC_TIMEOUT, 0x01, ip, port, protocol);
  const model = await mdc.getModel(env.MDC_TIMEOUT, 0x01, ip, port, protocol);

  if (isError(power) || isError(volume) || isError(source) ||
    isError(isMuted) || isError(model)) {
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
  { ip, port, protocol }: Device,
  args: TBridgeServiceArgs<"getStatus">
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.getStatus(env.MDC_TIMEOUT, 0x01, ip, port, protocol);
  return isError(res) ? res : true;
};

const mute = async ({
  ip,
  port,
  protocol
}: Device, args: TBridgeServiceArgs<"mute">) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setIsMute(true, 0x01, ip, port, protocol);
  return isError(res) ? res : true;
};

const unmute = async (
  { ip, port, protocol }: Device,
  args: TBridgeServiceArgs<"unmute">
) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc.setIsMute(false, 0x01, ip, port, protocol);
  return isError(res) ? res : true;
};

const setVolume = async (
  { ip, port, protocol }: Device,
  args: TBridgeServiceArgs<"setVolume">
) => {
  const setVolumeOptsSchema = z.object({ volume: z.number() }).strict();
  const parsedOpts = setVolumeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc
    .setVolume(parsedOpts.data.volume, 0x01, ip, port, protocol);
  return isError(res) ? res : true;
};

const setSource = async (
  { ip, port, protocol }: Device,
  args: TBridgeServiceArgs<"setSource">
) => {
  const setSourceOptsSchema = z
    .object({ source: MDCSourceSchema.keyof() })
    .strict();
  const parsedOpts = setSourceOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await mdc
    .setSource(mdc.sources[parsedOpts.data.source], 0x01, ip, port, protocol);
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
