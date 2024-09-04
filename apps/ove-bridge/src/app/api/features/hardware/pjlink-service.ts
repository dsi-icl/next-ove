/* global setTimeout */

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
import * as PJLink from "@ove/pjlink-control";
import { statusOptions } from "../../utils/status";

const reboot = async (device: Device, args: TBridgeServiceArgs<"reboot">, ac?: () => AbortController) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  }, PJLink.POWER.OFF);
  return await new Promise<boolean>(resolve =>
    setTimeout(async () => {
      await PJLink.setPower({
        timeout: env.PJLINK_TIMEOUT,
        device,
        ac: ac?.()
      }, PJLink.POWER.ON);
      resolve(true);
    }, 1000)
  );
};

const shutdown = async (
  device: Device,
  args: TBridgeServiceArgs<"shutdown">,
  ac?: () => AbortController
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  }, PJLink.POWER.OFF);
  return true;
};

const start = async (device: Device, args: TBridgeServiceArgs<"start">, ac?: () => AbortController) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink
    .setPower({
      timeout: env.PJLINK_TIMEOUT,
      device,
      ac: ac?.()
    }, PJLink.POWER.ON);

  if (isError(response)) {
    return response;
  }

  return true;
};

const getInfo = async (
  device: Device,
  args: TBridgeServiceArgs<"getInfo">,
  ac?: () => AbortController
) => {
  const infoOptsSchema =
    z.object({ type: z.literal("general").optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const info = await PJLink.getInfo({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const source = await PJLink.getInput({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const power = await PJLink.getPower({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const pjlinkClass = await PJLink.getClass({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const isMuted = await PJLink.getIsMuted({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const isAudioMuted = await PJLink.getIsAudioMuted({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const isVideoMuted = await PJLink.getIsVideoMuted({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const errors = await PJLink.getErrors({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const lamp = await PJLink.getLamp({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const name = await PJLink.getName({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const manufacturer = await PJLink.getManufacturer({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const product = await PJLink.getProduct({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });
  const sources = await PJLink.getInputs({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });

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
  args: TBridgeServiceArgs<"getStatus">,
  ac?: () => AbortController
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return statusOptions(async () => {
    const res = await PJLink.getPower({
      timeout: env.PJLINK_TIMEOUT,
      device,
      ac: ac?.()
    });
    return isError(res) ? res : "on";
  }, device.ip);
};

const setSource = async (
  device: Device,
  args: TBridgeServiceArgs<"setSource">,
  ac?: () => AbortController
) => {
  const setSourceOptsSchema = z
    .object({
      source: PJLinkSourceSchema.keyof(),
      channel: z.number().optional()
    })
    .strict();
  const parsedOpts = setSourceOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.setInput({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  }, PJLink.INPUT[parsedOpts.data.source], parsedOpts.data.channel);

  if (isError(response)) return response;

  return true;
};

const mute = async (device: Device, args: TBridgeServiceArgs<"mute">, ac?: () => AbortController) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.mute({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });

  if (isError(response)) return response;

  return true;
};

const unmute = async (device: Device, args: TBridgeServiceArgs<"unmute">, ac?: () => AbortController) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.unmute({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });

  if (isError(response)) return response;

  return true;
};

const muteAudio = async (
  device: Device,
  args: TBridgeServiceArgs<"muteAudio">,
  ac?: () => AbortController
) => {
  const muteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = muteAudioOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.muteAudio({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });

  if (isError(response)) return response;

  return true;
};

const unmuteAudio = async (
  device: Device,
  args: TBridgeServiceArgs<"unmuteAudio">,
  ac?: () => AbortController
) => {
  const unmuteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteAudioOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.unmuteAudio({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });

  if (isError(response)) return response;

  return true;
};

const muteVideo = async (
  device: Device,
  args: TBridgeServiceArgs<"muteVideo">,
  ac?: () => AbortController
) => {
  const muteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = muteVideoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.muteVideo({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });

  if (isError(response)) return response;

  return true;
};

const unmuteVideo = async (
  device: Device,
  args: TBridgeServiceArgs<"unmuteVideo">,
  ac?: () => AbortController
) => {
  const unmuteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteVideoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const response = await PJLink.unmuteVideo({
    timeout: env.PJLINK_TIMEOUT,
    device,
    ac: ac?.()
  });

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
