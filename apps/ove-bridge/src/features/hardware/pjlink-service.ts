/* global AbortController, setTimeout */

import {
  type Device,
  type PJLinkInfo,
  PJLinkSource,
  PJLinkSourceSchema,
  TBridgeHardwareService,
  type TBridgeServiceArgs
} from "@ove/ove-types";
import { z } from "zod";
import { env } from "../../env";
import * as PJLink from "@ove/pjlink-control";
import { syncStatus } from "../../utils/status";
import { controller } from "../reconciliation/controller";
import { PJLinkState } from "../reconciliation/state";

const reboot = async (
  device: Device,
  args: TBridgeServiceArgs<"reboot">,
  ac?: () => AbortController,
) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(
    device.id,
    {
      timeout: env.HARDWARE.TIMEOUTS.PJLINK,
      device,
      ac: ac?.(),
    },
    PJLink.POWER.OFF,
  );
  return await new Promise<boolean>((resolve) =>
    setTimeout(async () => {
      await PJLink.setPower(
        device.id,
        {
          timeout: env.HARDWARE.TIMEOUTS.PJLINK,
          device,
          ac: ac?.(),
        },
        PJLink.POWER.ON,
      );
      resolve(true);
    }, 1000),
  );
};

const shutdown = async (
  device: Device,
  args: TBridgeServiceArgs<"shutdown">,
  ac?: () => AbortController,
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(
    device.id,
    {
      timeout: env.HARDWARE.TIMEOUTS.PJLINK,
      device,
      ac: ac?.(),
    },
    PJLink.POWER.OFF,
  );
  return true;
};

const start = async (
  device: Device,
  args: TBridgeServiceArgs<"start">,
  ac?: () => AbortController,
) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setPower(
    device.id,
    {
      timeout: env.HARDWARE.TIMEOUTS.PJLINK,
      device,
      ac: ac?.(),
    },
    PJLink.POWER.ON,
  );

  return true;
};

const getInfo = async (
  device: Device,
  args: TBridgeServiceArgs<"getInfo">,
  ac?: () => AbortController,
): Promise<undefined | PJLinkInfo> => {
  const infoOptsSchema = z
    .object({ type: z.literal("general").optional() })
    .strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const info = await PJLink.getInfo(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const source = await PJLink.getInput(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const power = await PJLink.getPower(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const pjlinkClass = await PJLink.getClass(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const isMuted = await PJLink.getIsMuted(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const isAudioMuted = await PJLink.getIsAudioMuted(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const isVideoMuted = await PJLink.getIsVideoMuted(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const errors = await PJLink.getErrors(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const lamp = await PJLink.getLamp(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const name = await PJLink.getName(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const manufacturer = await PJLink.getManufacturer(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const product = await PJLink.getProduct(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });
  const sources = await PJLink.getInputs(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });

  (controller.getState()[device.id] as PJLinkState).muted.observed = isMuted;
  (controller.getState()[device.id] as PJLinkState).source.observed =
    source as keyof PJLinkSource;
  (controller.getState()[device.id] as PJLinkState).audio.observed =
    isAudioMuted;
  (controller.getState()[device.id] as PJLinkState).video.observed =
    isVideoMuted;

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
    sources,
  };
};

const getStatus = async (
  device: Device,
  args: TBridgeServiceArgs<"getStatus">,
  ac?: () => AbortController,
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return syncStatus(async () => {
    const res = await PJLink.getPower(device.id, {
      timeout: env.HARDWARE.TIMEOUTS.PJLINK,
      device,
      ac: ac?.(),
    });
    switch (res) {
      case "1":
      case "3": // warming up → effectively on
        return "on";

      case "0":
      case "2": // cooling down → effectively off
        return "off";

      default:
        throw new Error(`Unknown power state: ${res}`);
    }
  }, device);
};

const setSource = async (
  device: Device,
  args: TBridgeServiceArgs<"setSource">,
  ac?: () => AbortController,
) => {
  const setSourceOptsSchema = z
    .object({
      source: PJLinkSourceSchema.keyof(),
      channel: z.number().optional(),
    })
    .strict();
  const parsedOpts = setSourceOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.setInput(
    device.id,
    {
      timeout: env.HARDWARE.TIMEOUTS.PJLINK,
      device,
      ac: ac?.(),
    },
    PJLink.INPUT[parsedOpts.data.source],
    parsedOpts.data.channel,
  );

  return true;
};

const mute = async (
  device: Device,
  args: TBridgeServiceArgs<"mute">,
  ac?: () => AbortController,
) => {
  const muteOptsSchema = z.object({}).strict();
  const parsedOpts = muteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.mute(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });

  return true;
};

const unmute = async (
  device: Device,
  args: TBridgeServiceArgs<"unmute">,
  ac?: () => AbortController,
) => {
  const unmuteOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.unmute(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });

  return true;
};

const muteAudio = async (
  device: Device,
  args: TBridgeServiceArgs<"muteAudio">,
  ac?: () => AbortController,
) => {
  const muteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = muteAudioOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.muteAudio(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });

  return true;
};

const unmuteAudio = async (
  device: Device,
  args: TBridgeServiceArgs<"unmuteAudio">,
  ac?: () => AbortController,
) => {
  const unmuteAudioOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteAudioOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.unmuteAudio(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });

  return true;
};

const muteVideo = async (
  device: Device,
  args: TBridgeServiceArgs<"muteVideo">,
  ac?: () => AbortController,
) => {
  const muteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = muteVideoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.muteVideo(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });

  return true;
};

const unmuteVideo = async (
  device: Device,
  args: TBridgeServiceArgs<"unmuteVideo">,
  ac?: () => AbortController,
) => {
  const unmuteVideoOptsSchema = z.object({}).strict();
  const parsedOpts = unmuteVideoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await PJLink.unmuteVideo(device.id, {
    timeout: env.HARDWARE.TIMEOUTS.PJLINK,
    device,
    ac: ac?.(),
  });

  return true;
};

const getLiveUpdate = async (device: Device) => {
  const current = controller.getState()[device.id];
  if (current.type !== "pjlink") throw new Error("Invalid device type");
  return {
    type: "pjlink" as const,
    status: current.status?.observed ?? null,
  };
};

const getReconciliationState = async (device: Device) => {
  const current = controller.getState()[device.id];
  if (current.type !== "pjlink") throw new Error("Invalid device type");
  return {
    observed: {
      type: "pjlink" as const,
      status: current.status.observed ?? null,
      source: current.source.observed ?? null,
      isMuted: current.muted.observed ?? null,
      isAudioMuted: current.audio.observed ?? null,
      isVideoMuted: current.video.observed ?? null,
    },
    target: {
      type: "pjlink" as const,
      status: current.status.target ?? null,
      source: current.source.target ?? null,
      isMuted: current.muted.target ?? null,
      isAudioMuted: current.audio.target ?? null,
      isVideoMuted: current.video.target ?? null,
    },
  };
};

const PJLinkService = {
  type: "pjlink" as const,
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
  unmuteVideo,
  getLiveUpdate,
  getReconciliationState,
} satisfies TBridgeHardwareService & { type: string };

export type PJLinkService = typeof PJLinkService;
export default PJLinkService;
