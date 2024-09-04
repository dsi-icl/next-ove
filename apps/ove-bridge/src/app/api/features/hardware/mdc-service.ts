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
  args: TBridgeServiceArgs<"reboot">,
  ac?: () => AbortController
) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setPower({
    id: 0x01,
    timeout: env.MDC_TIMEOUT,
    ip,
    ac: ac?.(),
    port
  }, "reboot");
};

const shutdown = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"shutdown">,
  ac?: () => AbortController
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setPower({
    id: 0x01,
    timeout: env.MDC_TIMEOUT,
    ip,
    ac: ac?.(),
    port
  }, "off");
};

const start = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"start">,
  ac?: () => AbortController
) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setPower({
    id: 0x01,
    timeout: env.MDC_TIMEOUT,
    ip,
    ac: ac?.(),
    port
  }, "on");
};

const getInfo = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"getInfo">,
  ac?: () => AbortController
) => {
  const infoOptsSchema = z
    .object({ type: z.literal("general").optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.getInfo({
    timeout: env.MDC_TIMEOUT,
    id: 0x01,
    ip,
    ac: ac?.(),
    port
  });
};

const getStatus = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"getStatus">,
  ac?: () => AbortController
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return statusOptions(async () =>
    mdc.getStatus({
      timeout: env.MDC_TIMEOUT,
      id: 0x01,
      ip,
      ac: ac?.(),
      port
    }), ip);
};

const mute = async ({
  ip,
  port
}: Device, args: TBridgeServiceArgs<"mute">, ac?: () => AbortController) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setIsMute({
    id: 0x01,
    timeout: env.MDC_TIMEOUT,
    ip,
    ac: ac?.(),
    port
  }, true);
};

const unmute = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"unmute">,
  ac?: () => AbortController
) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setIsMute({
    id: 0x01,
    timeout: env.MDC_TIMEOUT,
    ip,
    ac: ac?.(),
    port
  }, false);
};

const setVolume = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"setVolume">,
  ac?: () => AbortController
) => {
  const setVolumeOptsSchema = z.object({ volume: z.number() }).strict();
  const parsedOpts = setVolumeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc
    .setVolume({
      id: 0x01,
      timeout: env.MDC_TIMEOUT,
      ip,
      ac: ac?.(),
      port
    }, parsedOpts.data.volume);
};

const setSource = async (
  { ip, port }: Device,
  args: TBridgeServiceArgs<"setSource">,
  ac?: () => AbortController
) => {
  const setSourceOptsSchema = z
    .object({ source: MDCSourceSchema.keyof() })
    .strict();
  const parsedOpts = setSourceOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return mdc.setSource({
    timeout: env.MDC_TIMEOUT,
    id: 0x01,
    ip,
    ac: ac?.(),
    port
  }, mdc.sources[parsedOpts.data.source]);
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
