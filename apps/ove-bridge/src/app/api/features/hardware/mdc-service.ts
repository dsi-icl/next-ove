/* global setTimeout */

import {
  type Device,
  type TBridgeHardwareService,
  type TBridgeServiceArgs,
  MDCSourceSchema
} from "@ove/ove-types";
import { z } from "zod";
import { env } from "../../../../env";
import * as mdc from "@ove/mdc-control";
import { statusOptions } from "../../utils/status";

const reboot = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"reboot">
) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setPower("reboot", env.MDC_TIMEOUT, 0x01, ip, port);
};

const shutdown = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"shutdown">
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setPower("off", env.MDC_TIMEOUT, 0x01, ip, port);
};

const start = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"start">
) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setPower("on", env.MDC_TIMEOUT, 0x01, ip, port);
};

const getInfo = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"getInfo">
) => {
  const infoOptsSchema = z
    .object({ type: z.literal("general").optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.getInfo(env.MDC_TIMEOUT, 0x01, ip, port);
};

const getStatus = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"getStatus">
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return statusOptions(async () => mdc.getStatus(env.MDC_TIMEOUT, 0x01, ip, port), ip);
};

const mute = async ({
  ip,
  port
}: Device, args: TBridgeServiceArgs<"mute">) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setIsMute(true, env.MDC_TIMEOUT, 0x01, ip, port);
};

const unmute = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"unmute">
) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setIsMute(false, env.MDC_TIMEOUT, 0x01, ip, port);
};

const setVolume = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"setVolume">
) => {
  const setVolumeOptsSchema = z.object({ volume: z.number() }).strict();
  const parsedOpts = setVolumeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc
    .setVolume(parsedOpts.data.volume, env.MDC_TIMEOUT, 0x01, ip, port);
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

  return mdc
    .setSource(mdc.sources[parsedOpts.data.source], env.MDC_TIMEOUT, 0x01, ip, port);
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
