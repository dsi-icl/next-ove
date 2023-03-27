import * as mdc from "@ove/mdc-control";
import { Device, MDCInfo, Status, DS, DSArgs } from "@ove/ove-types";
import { MDCSourceSchema } from "@ove/mdc-control";
import { z } from "zod";

const reboot = async ({
  ip,
  port
}: Device, args: DSArgs<"reboot", DS<MDCInfo>>) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

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
}: Device, args: DSArgs<"shutdown", DS<MDCInfo>>) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setPower(0x01, ip, port, "off");
  return true;
};

const start = async ({
  ip,
  port
}: Device, args: DSArgs<"start", DS<MDCInfo>>) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setPower(0x01, ip, port, "on");
  return true;
};

const getInfo = async ({
  ip,
  port
}: Device, args: DSArgs<"getInfo", DS<MDCInfo>>) => {
  const infoOptsSchema = z.object({}).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

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

const getStatus = async ({
  ip,
  port
}: Device, args: DSArgs<"getStatus", DS<MDCInfo>>) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.getStatus(0x01, ip, port);
  return true;
};

const mute = async ({
  ip,
  port
}: Device, args: DSArgs<"mute", DS<MDCInfo>>) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setIsMute(0x01, ip, port, true);
  return true;
};

const unmute = async ({
  ip,
  port
}: Device, args: DSArgs<"unmute", DS<MDCInfo>>) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setIsMute(0x01, ip, port, false);
  return true;
};

const setVolume = async ({
  ip,
  port
}: Device, args: DSArgs<"setVolume", DS<MDCInfo>>) => {
  const setVolumeOptsSchema = z.object({ volume: z.number() }).strict();
  const parsedOpts = setVolumeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setVolume(0x01, ip, port, parsedOpts.data.volume);
  return true;
};

const setSource = async ({
  ip,
  port
}: Device, args: DSArgs<"setSource", DS<MDCInfo>>) => {
  const setSourceOptsSchema = z.object({ source: MDCSourceSchema.keyof() }).strict();
  const parsedOpts = setSourceOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setSource(0x01, ip, port, parsedOpts.data.source);
  return true;
};

const MDCService: DS<MDCInfo> = {
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
