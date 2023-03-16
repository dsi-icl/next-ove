import * as PJLink from "@ove/pjlink-control";
import {
  Device,
  is,
  OVEException,
  OVEExceptionSchema,
  Response,
  DeviceService,
  Options,
  Status, Optional
} from "@ove/ove-types";
import { z } from "zod";
import { Utils } from "@ove/ove-utils";

type PJLinkInfo = {
  info: string,
  source: string
};

const reboot = async (device: Device, opts: Options): Promise<Optional<Status | OVEException>> => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(device, PJLink.POWER.OFF);
  return await new Promise<boolean>(resolve => setTimeout(async () => {
    await PJLink.setPower(device, PJLink.POWER.ON);
    resolve(true);
  }, 1000));
};

const shutdown = async (device: Device, opts: Options): Promise<Optional<Status | OVEException>> => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(device, PJLink.POWER.OFF);
  return true;
};

const start = async (device: Device, opts: Options): Promise<Optional<Status | OVEException>> => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.setPower(device, PJLink.POWER.ON);

  if (is(OVEExceptionSchema, response)) {
    return response;
  }

  return true;
};

const info = async (device: Device, opts: Options): Promise<Optional<PJLinkInfo | OVEException>> => {
  const infoOptsSchema = z.object({}).strict();
  const parsedOpts = infoOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  const info = await PJLink.getInfo(device);
  const source = await PJLink.getInput(device);

  if (is(OVEExceptionSchema, info) || is(OVEExceptionSchema, source)) {
    return { oveError: "Unable to gather system information" };
  }

  return {
    info,
    source
  };
};

const status = async (device: Device, opts: Options): Promise<Optional<Response | OVEException>> => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.getPower(device);

  if (is(OVEExceptionSchema, response)) {
    return response;
  }

  return { response: "running" };
};

const setSource = async (device: Device, opts: Options): Promise<Status | OVEException> => {
  const setSourceOptsSchema = z.object({
    source: PJLink.InputSchema.keyof(),
    channel: z.number().optional()
  }).strict();
  const parsedOpts = setSourceOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  await PJLink.setInput(device, PJLink.INPUT[parsedOpts.data.source], parsedOpts.data.channel);
  return true;
};

const mute = async (device: Device, opts: Options): Promise<Status | OVEException> => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  await PJLink.mute(device);
  return true;
};

const unmute = async (device: Device, opts: Options): Promise<Status | OVEException> => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  await PJLink.unmute(device);
  return true;
};

const ProjectorService: DeviceService<PJLinkInfo, PJLink.Input> = {
  reboot,
  shutdown,
  start,
  info,
  status,
  setSource,
  mute,
  unmute
};

export default ProjectorService;
