import * as mdc from "@ove/mdc-control";
import {
  Device,
  MDCInfo,
  OVEException,
  Response,
  DeviceService,
  Options,
  Status, Optional
} from "@ove/ove-types";
import { MDCSourceSchema } from "@ove/mdc-control";
import { z } from "zod";
import { Utils } from "@ove/ove-utils";

const reboot = async ({
  ip,
  port
}: Device, opts: Options): Promise<Optional<Status | OVEException>> => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await mdc.setPower(0x01, ip, port, "off");
  return await new Promise<Status>(resolve => setTimeout(async () => {
    await mdc.setPower(0x01, ip, port, "on");
    resolve(true);
  }, 1000));
};

const shutdown = async ({
  ip,
  port
}: Device, opts: Options): Promise<Optional<Status | OVEException>> => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await mdc.setPower(0x01, ip, port, "off");
  return true;
};

const start = async ({
  ip,
  port
}: Device, opts: Options): Promise<Optional<Status | OVEException>> => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await mdc.setPower(0x01, ip, port, "on");
  return true;
};

const info = async ({
  ip,
  port
}: Device, opts: Options): Promise<Optional<MDCInfo | OVEException>> => {
  const infoOptsSchema = z.object({}).strict();
  const parsedOpts = infoOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  const power = await mdc.getPower(0x01, ip, port);
  const volume = await mdc.getVolume(0x01, ip, port);
  const source = await mdc.getSource(0x01, ip, port);
  const isMuted = await mdc.getIsMute(0x01, ip, port);
  const model = await mdc.getModel(0x01, ip, port);

  return {
    power,
    volume,
    source,
    isMuted,
    model
  };
};

const status = async ({
  ip,
  port
}: Device, opts: Options): Promise<Optional<Response | OVEException>> => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  const response = await mdc.getStatus(0x01, ip, port);
  return { response };
};

const mute = async ({
  ip,
  port
}: Device, opts: Options): Promise<Status | OVEException> => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  await mdc.setIsMute(0x01, ip, port, true);
  return true;
};

const unmute = async ({
  ip,
  port
}: Device, opts: Options): Promise<Status | OVEException> => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  await mdc.setIsMute(0x01, ip, port, false);
  return true;
};

const setVolume = async ({
  ip,
  port
}: Device, opts: Options): Promise<Status | OVEException> => {
  const setVolumeOptsSchema = z.object({ volume: z.number() }).strict();
  const parsedOpts = setVolumeOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  await mdc.setVolume(0x01, ip, port, parsedOpts.data.volume);
  return true;
};

const setSource = async ({
  ip,
  port
}: Device, opts: Options): Promise<Status | OVEException> => {
  const setSourceOptsSchema = z.object({ source: MDCSourceSchema.keyof() }).strict();
  const parsedOpts = setSourceOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  await mdc.setSource(0x01, ip, port, parsedOpts.data.source);
  return true;
};

const MDCService: DeviceService<MDCInfo> = {
  reboot,
  shutdown,
  start,
  info,
  status,
  mute,
  unmute,
  setVolume,
  setSource
};

export default MDCService;
