/* global setTimeout */

import * as mdc from "@ove/mdc-control";
import { Device, Status, DS, DSArgs, MDCSourceSchema } from "@ove/ove-types";
import { z } from "zod";
import { sources } from "@ove/mdc-control";

const reboot = async ({
  ip,
  port
}: Device, args: DSArgs<"reboot">) => {
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
}: Device, args: DSArgs<"shutdown">) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setPower(0x01, ip, port, "off");
  return true;
};

const start = async ({
  ip,
  port
}: Device, args: DSArgs<"start">) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setPower(0x01, ip, port, "on");
  return true;
};

const getInfo = async ({
  ip,
  port
}: Device, args: DSArgs<"getInfo">) => {
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
}: Device, args: DSArgs<"getStatus">) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.getStatus(0x01, ip, port);
  return true;
};

const mute = async ({
  ip,
  port
}: Device, args: DSArgs<"mute">) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setIsMute(0x01, ip, port, true);
  return true;
};

const unmute = async ({
  ip,
  port
}: Device, args: DSArgs<"unmute">) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setIsMute(0x01, ip, port, false);
  return true;
};

const setVolume = async ({
  ip,
  port
}: Device, args: DSArgs<"setVolume">) => {
  const setVolumeOptsSchema = z.object({ volume: z.number() }).strict();
  const parsedOpts = setVolumeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setVolume(0x01, ip, port, parsedOpts.data.volume);
  return true;
};

const setSource = async ({
  ip,
  port
}: Device, args: DSArgs<"setSource">) => {
  const setSourceOptsSchema =
    z.object({ source: MDCSourceSchema.keyof() }).strict();
  const parsedOpts = setSourceOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await mdc.setSource(0x01, ip, port, sources[parsedOpts.data.source]);
  return true;
};

const MDCService: DS = {
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
