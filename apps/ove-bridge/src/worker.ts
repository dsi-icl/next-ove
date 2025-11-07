import { parentPort } from "worker_threads";
import { type Device, isError, type PJLinkSource } from "@ove/ove-types";
import { getServiceForProtocol } from "./features/hardware/utils";
import type {
  MDCState,
  NodeState,
  PJLinkState,
  State,
} from "./features/reconciliation/state";
import { logger } from "./env";
import { Json, safe } from "@ove/ove-utils";
import type { NodeService } from "./features/hardware/node-service";
import type { MDCService } from "./features/hardware/mdc-service";
import type { PJLinkService } from "./features/hardware/pjlink-service";

if (!parentPort) {
  throw new Error("This file is meant to be run as a Worker");
}

let state: State;

type MessageData = { devices: Device[]; state: State };

type Data =
  | ({
      type: "init";
      reconcile: boolean;
    } & MessageData)
  | { type: "update"; deviceId: string; key: string; value: any };

const update = async ({
  deviceId,
  key,
  value,
}: {
  deviceId: string;
  key: string;
  value: any;
}) => {
  if (state === undefined) {
    throw new Error();
  }
  (state[deviceId] as any)[key].target = value;
};

const reconcileStatus = async (
  current: State[keyof State],
  device: Device,
  service: ReturnType<typeof getServiceForProtocol>,
) => {
  if (
    current.status.target === current.status.observed ||
    current.status.target === null
  )
    return;
  if (current.status.target) {
    await safe(logger, async () => {
      if (current.status.target === null) return;
      return service.start(device, {});
    });
  } else {
    await safe(logger, async () => {
      if (current.status.target === null) return;
      return service.shutdown(device, {});
    });
  }
};

const reconcileBrowsers = async (
  current: NodeState,
  device: Device,
  service: NodeService,
) => {
  if (
    current.browsers.target === null ||
    current.browsers.target ===
      (current.browsers.observed !== undefined &&
        !isError(
          current.browsers.observed
            ? Object.keys(current.browsers.observed).length > 0
            : current.browsers.observed,
        ))
  )
    return;
  if (current.browsers.target) {
    await safe(logger, async () => {
      if (current.browsers.target === null) return;
      return service.openBrowsers(device, {});
    });
  } else {
    await safe(logger, async () => {
      if (current.browsers.target === null) return;
      return service.closeBrowsers(device, {});
    });
  }
};

const reconcileBrowserConfig = async (
  current: NodeState,
  device: Device,
  service: NodeService,
) => {
  if (
    current.browserConfigs.target === null ||
    !Json.equals(current.browserConfigs.target, current.browserConfigs.observed)
  )
    return;
  await safe(logger, async () => {
    if (current.browserConfigs.target === null) return;
    return service.setBrowserConfig(device, {
      config: current.browserConfigs.target,
    });
  });
};

const reconcileSource = async (
  current: MDCState | PJLinkState,
  device: Device,
  service: MDCService | PJLinkService,
) => {
  if (
    current.source.target === null ||
    current.source.target === current.source.observed
  )
    return;
  await safe(logger, async () => {
    if (current.source.target === null) return;
    return service.setSource(device, {
      source: current.source.target,
    });
  });
};

const reconcileVolume = async (
  current: MDCState,
  device: Device,
  service: MDCService,
) => {
  if (
    current.volume.target === null ||
    current.volume.target === current.volume.observed
  )
    return;
  await safe(logger, async () => {
    if (current.volume.target === null) return;
    return service.setVolume(device, {
      volume: current.volume.target,
    });
  });
};

const reconcileMuted = async (
  current: MDCState | PJLinkState,
  device: Device,
  service: MDCService | PJLinkService,
) => {
  if (
    current.muted.target === null ||
    current.muted.target === current.muted.observed
  )
    return;
  if (current.muted.target) {
    await safe(logger, async () => {
      if (current.muted.target === null) return;
      return service.mute(device, {});
    });
  } else {
    await safe(logger, async () => {
      if (current.muted.target === null) return;
      return service.unmute(device, {});
    });
  }
};

const reconcileAudio = async (
  current: PJLinkState,
  device: Device,
  service: PJLinkService,
) => {
  if (
    current.audio.target === null ||
    current.audio.target === current.audio.observed
  )
    return;
  if (current.audio.target) {
    await safe(logger, async () => {
      if (current.audio.target === null) return;
      return service.muteAudio(device, {});
    });
  } else {
    await safe(logger, async () => {
      if (current.audio.target === null) return;
      return service.unmuteAudio(device, {});
    });
  }
};

const reconcileVideo = async (
  current: PJLinkState,
  device: Device,
  service: PJLinkService,
) => {
  if (
    current.video.target === null ||
    current.video.target === current.video.observed
  )
    return;
  if (current.video.target) {
    await safe(logger, async () => {
      if (current.video.target === null) return;
      return service.muteVideo(device, {});
    });
  } else {
    await safe(logger, async () => {
      if (current.video.target === null) return;
      return service.unmuteVideo(device, {});
    });
  }
};

const observeNode = async (
  current: NodeState,
  device: Device,
  service: NodeService,
) => {
  const status = await safe(logger, () => service.getStatus(device, {}));
  const browsers = await safe(logger, () => service.getBrowsers(device, {}));
  const configs = await safe(logger, () =>
    service.getBrowserConfig(device, {}),
  );
  const screenshots = await safe(logger, () =>
    service.screenshot(device, {
      method: "response",
      screens:
        configs !== undefined && !isError(configs)
          ? Array.from({ length: configs.length }).map((_x, i) => i)
          : [],
    }),
  );

  state[device.id] = {
    type: "node" as const,
    status: {
      target: current.status.target,
      observed: status ?? null,
    },
    browsers: {
      target: current.browsers.target,
      observed: browsers ?? null,
    },
    browserConfigs: {
      target: current.browserConfigs.target,
      observed: configs ?? null,
    },
    screenshots: screenshots ?? null,
  };
  logger.trace("Observed Node state:", state[device.id]);
};

const observeMDC = async (
  current: MDCState,
  device: Device,
  service: MDCService,
) => {
  const status = await safe(logger, () => service.getStatus(device, {}));
  const info = await safe(logger, () => service.getInfo(device, {}));
  const source = info !== undefined && !isError(info) ? info.source : info;
  const volume = info !== undefined && !isError(info) ? info.volume : info;
  const muted = info !== undefined && !isError(info) ? info.isMuted : info;

  state[device.id] = {
    type: "mdc" as const,
    status: {
      target: current.status.target,
      observed: status ?? null,
    },
    source: {
      target: current.source.target,
      observed: source ?? null,
    },
    volume: {
      target: current.volume.target,
      observed: volume ?? null,
    },
    muted: {
      target: current.muted.target,
      observed: muted ?? null,
    },
  };
  logger.trace("Observed MDC state:", state[device.id]);
};

const observePJLink = async (
  current: PJLinkState,
  device: Device,
  service: PJLinkService,
) => {
  const status = await safe(logger, () => service.getStatus(device, {}));
  const info = await safe(logger, () => service.getInfo(device, {}));
  const source =
    info !== undefined && !isError(info)
      ? (info.source as keyof PJLinkSource)
      : info;
  const muted = info !== undefined && !isError(info) ? info.isMuted : info;
  const audio = info !== undefined && !isError(info) ? info.isAudioMuted : info;
  const video = info !== undefined && !isError(info) ? info.isVideoMuted : info;

  state[device.id] = {
    type: "pjlink" as const,
    status: {
      target: current.status.target,
      observed: status ?? null,
    },
    source: {
      target: current.source.target,
      observed: source ?? null,
    },
    muted: {
      target: current.muted.target,
      observed: muted ?? null,
    },
    audio: {
      target: current.audio.target,
      observed: audio ?? null,
    },
    video: {
      target: current.video.target,
      observed: video ?? null,
    },
  };
  logger.trace("Observed PJLink state:", state[device.id]);
};

parentPort.on("message", async (data: Data) => {
  if (data.type === "update") {
    update(data).catch(console.error);
    return;
  }
  state = data.state;
  for (const device of data.devices) {
    logger.trace("Resolving device:", device.id);
    const current = state[device.id];
    if (current === undefined) continue;
    const service = getServiceForProtocol(device.type);

    try {
      switch (service.type) {
        case "node": {
          if (current.type !== "node") continue;
          await observeNode(current, device, service);
          break;
        }
        case "mdc": {
          if (current.type !== "mdc") continue;
          await observeMDC(current, device, service);
          break;
        }
        case "pjlink": {
          if (current.type !== "pjlink") continue;
          await observePJLink(current, device, service);
          break;
        }
      }
    } catch (e) {
      logger.trace(e);
    }
    parentPort?.postMessage({
      type: "update",
      deviceId: device.id,
      state: state[device.id],
    });

    if (!data.reconcile) continue;

    switch (device.type) {
      case "node": {
        const current = state[device.id];
        if (current.type !== "node" || service.type !== "node") continue;
        await reconcileStatus(current, device, service);
        await reconcileBrowsers(current, device, service);
        await reconcileBrowserConfig(current, device, service);
        break;
      }
      case "mdc": {
        const current = state[device.id];
        if (current.type !== "mdc" || service.type !== "mdc") continue;
        await reconcileStatus(current, device, service);
        await reconcileSource(current, device, service);
        await reconcileVolume(current, device, service);
        await reconcileMuted(current, device, service);
        break;
      }
      case "pjlink": {
        const current = state[device.id];
        if (current.type !== "pjlink" || service.type !== "pjlink") continue;
        await reconcileStatus(current, device, service);
        await reconcileSource(current, device, service);
        await reconcileMuted(current, device, service);
        await reconcileAudio(current, device, service);
        await reconcileVideo(current, device, service);
        break;
      }
    }
  }
  if (parentPort === null) throw new Error("Parent port is null");
  parentPort.postMessage({ type: "complete" });
});
