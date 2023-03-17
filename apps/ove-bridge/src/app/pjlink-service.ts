import * as PJLink from "@ove/pjlink-control";
import {
  Device,
  is,
  OVEExceptionSchema,
  Response,
  DeviceService,
  Options,
  Status,
  Optional,
  PJLinkSourceSchema,
  DeviceResponse
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

const reboot = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(device, PJLink.POWER.OFF);
  return await new Promise<boolean>(resolve => setTimeout(async () => {
    await PJLink.setPower(device, PJLink.POWER.ON);
    resolve(true);
  }, 1000));
};

const shutdown = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(device, PJLink.POWER.OFF);
  return true;
};

const start = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.setPower(device, PJLink.POWER.ON);

  if (is(OVEExceptionSchema, response)) {
    return response;
  }

  return true;
};

const info = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<PJLinkInfo>>> => {
  const infoOptsSchema = z.object({}).strict();
  const parsedOpts = infoOptsSchema.safeParse(opts);

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

const status = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Response>>> => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.getPower(device);

  if (is(OVEExceptionSchema, response)) {
    return response;
  }

  return { response: "running" };
};

const setSource = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const setSourceOptsSchema = z.object({
    source: PJLinkSourceSchema.keyof(),
    channel: z.number().optional()
  }).strict();
  const parsedOpts = setSourceOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.setInput(device, PJLink.INPUT[parsedOpts.data.source], parsedOpts.data.channel);
  return true;
};

const mute = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.mute(device);
  return true;
};

const unmute = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.unmute(device);
  return true;
};

const muteAudio = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const muteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = muteAudioOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.muteAudio(device);
  return true;
};

const unmuteAudio = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const unmuteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteAudioOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.unmuteAudio(device);
  return true;
};

const muteVideo = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const muteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = muteVideoOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.muteVideo(device);
  return true;
};

const unmuteVideo = async (device: Device, opts: Options): Promise<Optional<DeviceResponse<Status>>> => {
  const unmuteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteVideoOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.unmuteVideo(device);
  return true;
};

const PJLinkService: DeviceService<PJLinkInfo> = {
  reboot,
  shutdown,
  start,
  info,
  status,
  setSource,
  mute,
  unmute,
  muteAudio,
  unmuteAudio,
  muteVideo,
  unmuteVideo
};

export default PJLinkService;
