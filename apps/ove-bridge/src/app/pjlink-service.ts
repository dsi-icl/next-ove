import * as PJLink from "@ove/pjlink-control";
import {
  Device,
  is,
  OVEExceptionSchema,
  PJLinkSourceSchema,
  DS,
  DSArgs
} from "@ove/ove-types";
import { z } from "zod";

type PJLinkInfo = {
  info: string;
  source: string;
  power: string;
  pjlinkClass: string;
  isMuted: string;
  errors: string;
  lamp: string;
  sources: string;
  manufacturer: string;
  product: string;
  name: string;
};

const reboot = async (device: Device, args: DSArgs<"reboot", DS<PJLinkInfo>>) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(device, PJLink.POWER.OFF);
  return await new Promise<boolean>(resolve => setTimeout(async () => {
    await PJLink.setPower(device, PJLink.POWER.ON);
    resolve(true);
  }, 1000));
};

const shutdown = async (device: Device, args: DSArgs<"shutdown", DS<PJLinkInfo>>) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(device, PJLink.POWER.OFF);
  return true;
};

const start = async (device: Device, args: DSArgs<"start", DS<PJLinkInfo>>) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.setPower(device, PJLink.POWER.ON);

  if (is(OVEExceptionSchema, response)) {
    return response;
  }

  return true;
};

const getInfo = async (device: Device, args: DSArgs<"getInfo", DS<PJLinkInfo>>) => {
  const infoOptsSchema = z.object({}).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const info = await PJLink.getInfo(device);
  const source = await PJLink.getInput(device);
  const power = await PJLink.getPower(device);
  const pjlinkClass = await PJLink.getClass(device);
  const isMuted = await PJLink.getIsMuted(device);
  const errors = await PJLink.getErrors(device);
  const lamp = await PJLink.getLamp(device);
  const name = await PJLink.getName(device);
  const manufacturer = await PJLink.getManufacturer(device);
  const product = await PJLink.getProduct(device);
  const sources = await PJLink.getInputs(device);

  if (is(OVEExceptionSchema, info) || is(OVEExceptionSchema, source) || is(OVEExceptionSchema, power) || is(OVEExceptionSchema, pjlinkClass) || is(OVEExceptionSchema, isMuted) || is(OVEExceptionSchema, errors) || is(OVEExceptionSchema, lamp) || is(OVEExceptionSchema, name) || is(OVEExceptionSchema, manufacturer) || is(OVEExceptionSchema, product) || is(OVEExceptionSchema, sources)) {
    return { oveError: "Unable to gather system information" };
  }

  return {
    info,
    source,
    power,
    pjlinkClass,
    isMuted,
    errors,
    lamp,
    name,
    manufacturer,
    product,
    sources
  };
};

const getStatus = async (device: Device, args: DSArgs<"getStatus", DS<PJLinkInfo>>) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.getPower(device);

  if (is(OVEExceptionSchema, response)) {
    return response;
  }

  return true;
};

const setSource = async (device: Device, args: DSArgs<"setSource", DS<PJLinkInfo>>) => {
  const setSourceOptsSchema = z.object({
    source: PJLinkSourceSchema.keyof(),
    channel: z.number().optional()
  }).strict();
  const parsedOpts = setSourceOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.setInput(device, PJLink.INPUT[parsedOpts.data.source], parsedOpts.data.channel);

  if (is(OVEExceptionSchema, response)) return response;

  return true;
};

const mute = async (device: Device, args: DSArgs<"mute", DS<PJLinkInfo>>) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.mute(device);

  if (is(OVEExceptionSchema, response)) return response;

  return true;
};

const unmute = async (device: Device, args: DSArgs<"unmute", DS<PJLinkInfo>>) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.unmute(device);

  if (is(OVEExceptionSchema, response)) return response;

  return true;
};

const muteAudio = async (device: Device, args: DSArgs<"muteAudio", DS<PJLinkInfo>>) => {
  const muteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = muteAudioOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.muteAudio(device);

  if (is(OVEExceptionSchema, response)) return response;

  return true;
};

const unmuteAudio = async (device: Device, args: DSArgs<"unmuteAudio", DS<PJLinkInfo>>) => {
  const unmuteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteAudioOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.unmuteAudio(device);

  if (is(OVEExceptionSchema, response)) return response;

  return true;
};

const muteVideo = async (device: Device, args: DSArgs<"muteVideo", DS<PJLinkInfo>>) => {
  const muteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = muteVideoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.muteVideo(device);

  if (is(OVEExceptionSchema, response)) return response;

  return true;
};

const unmuteVideo = async (device: Device, args: DSArgs<"unmuteVideo", DS<PJLinkInfo>>) => {
  const unmuteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteVideoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.unmuteVideo(device);

  if (is(OVEExceptionSchema, response)) return response;

  return true;
};

const PJLinkService: DS<PJLinkInfo> = {
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
