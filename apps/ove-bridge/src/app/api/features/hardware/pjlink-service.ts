/* global setTimeout */

import * as PJLink from "@ove/pjlink-control";
import {
  type Device,
  isError,
  PJLinkSourceSchema,
  type TBridgeHardwareService,
  type TBridgeServiceArgs
} from "@ove/ove-types";
import { z } from "zod";
import { env } from "../../../../env";
import { raise } from "@ove/ove-utils";
import { statusOptions } from "../../utils/status";

const reboot = async (device: Device, args: TBridgeServiceArgs<"reboot">) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(env.PJLINK_TIMEOUT, device, PJLink.POWER.OFF);
  return await new Promise<boolean>(resolve =>
    setTimeout(async () => {
      await PJLink.setPower(env.PJLINK_TIMEOUT, device, PJLink.POWER.ON);
      resolve(true);
    }, 1000)
  );
};

const shutdown = async (
  device: Device,
  args: TBridgeServiceArgs<"shutdown">
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(env.PJLINK_TIMEOUT, device, PJLink.POWER.OFF);
  return true;
};

const start = async (device: Device, args: TBridgeServiceArgs<"start">) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink
    .setPower(env.PJLINK_TIMEOUT, device, PJLink.POWER.ON);

  if (isError(response)) {
    return response;
  }

  return true;
};

const getInfo = async (
  device: Device,
  args: TBridgeServiceArgs<"getInfo">
) => {
  const infoOptsSchema =
    z.object({ type: z.literal("general").optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const info = await PJLink.getInfo(env.PJLINK_TIMEOUT, device);
  const source = await PJLink.getInput(env.PJLINK_TIMEOUT, device);
  const power = await PJLink.getPower(env.PJLINK_TIMEOUT, device);
  const pjlinkClass = await PJLink.getClass(env.PJLINK_TIMEOUT, device);
  const isMuted = await PJLink.getIsMuted(env.PJLINK_TIMEOUT, device);
  const isAudioMuted = await PJLink.getIsAudioMuted(env.PJLINK_TIMEOUT, device);
  const isVideoMuted = await PJLink.getIsVideoMuted(env.PJLINK_TIMEOUT, device);
  const errors = await PJLink.getErrors(env.PJLINK_TIMEOUT, device);
  const lamp = await PJLink.getLamp(env.PJLINK_TIMEOUT, device);
  const name = await PJLink.getName(env.PJLINK_TIMEOUT, device);
  const manufacturer = await PJLink.getManufacturer(env.PJLINK_TIMEOUT, device);
  const product = await PJLink.getProduct(env.PJLINK_TIMEOUT, device);
  const sources = await PJLink.getInputs(env.PJLINK_TIMEOUT, device);

  if (
    isError(info) ||
    isError(source) ||
    isError(power) ||
    isError(pjlinkClass) ||
    isError(isMuted) ||
    isError(isAudioMuted) ||
    isError(isVideoMuted) ||
    isError(errors) ||
    isError(lamp) ||
    isError(name) ||
    isError(manufacturer) ||
    isError(product) ||
    isError(sources)
  ) {
    return raise("Unable to gather system information");
  }

  return {
    info,
    source,
    power,
    pjlinkClass,
    isMuted,
    isAudioMuted,
    isVideoMuted,
    errors,
    lamp,
    name,
    manufacturer,
    product,
    sources
  };
};

const getStatus = async (
  device: Device,
  args: TBridgeServiceArgs<"getStatus">
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return statusOptions(async () => {
    const res = await PJLink.getPower(env.PJLINK_TIMEOUT, device);
    return isError(res) ? res : "on";
  }, device.ip);
};

const setSource = async (
  device: Device,
  args: TBridgeServiceArgs<"setSource">
) => {
  const setSourceOptsSchema = z
    .object({
      source: PJLinkSourceSchema.keyof(),
      channel: z.number().optional()
    })
    .strict();
  const parsedOpts = setSourceOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.setInput(
    env.PJLINK_TIMEOUT,
    device,
    PJLink.INPUT[parsedOpts.data.source],
    parsedOpts.data.channel
  );

  if (isError(response)) return response;

  return true;
};

const mute = async (device: Device, args: TBridgeServiceArgs<"mute">) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.mute(env.PJLINK_TIMEOUT, device);

  if (isError(response)) return response;

  return true;
};

const unmute = async (device: Device, args: TBridgeServiceArgs<"unmute">) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.unmute(env.PJLINK_TIMEOUT, device);

  if (isError(response)) return response;

  return true;
};

const muteAudio = async (
  device: Device,
  args: TBridgeServiceArgs<"muteAudio">
) => {
  const muteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = muteAudioOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.muteAudio(env.PJLINK_TIMEOUT, device);

  if (isError(response)) return response;

  return true;
};

const unmuteAudio = async (
  device: Device,
  args: TBridgeServiceArgs<"unmuteAudio">
) => {
  const unmuteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteAudioOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.unmuteAudio(env.PJLINK_TIMEOUT, device);

  if (isError(response)) return response;

  return true;
};

const muteVideo = async (
  device: Device,
  args: TBridgeServiceArgs<"muteVideo">
) => {
  const muteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = muteVideoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.muteVideo(env.PJLINK_TIMEOUT, device);

  if (isError(response)) return response;

  return true;
};

const unmuteVideo = async (
  device: Device,
  args: TBridgeServiceArgs<"unmuteVideo">
) => {
  const unmuteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteVideoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.unmuteVideo(env.PJLINK_TIMEOUT, device);

  if (isError(response)) return response;

  return true;
};

const PJLinkService: TBridgeHardwareService = {
  reboot,
  shutdown,
  start,
  getInfo,
  getStatus,
  setSource,
  mute,
  unmute,
  muteAudio,
  unmuteAudio,
  muteVideo,
  unmuteVideo
};

export default PJLinkService;
