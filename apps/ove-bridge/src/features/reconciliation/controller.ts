/* global clearInterval, NodeJS, setInterval */

import { env, logger } from "../../env";
import { Worker } from "worker_threads";
import path from "path";
import { Json } from "@ove/ove-utils";
import type { State } from "./state";
import type { TBridgeHardwareService } from "@ove/ove-types";

const initNodeState = () => ({
  type: "node" as const,
  status: {
    target: null,
    observed: null,
  },
  browsers: {
    target: null,
    observed: null,
  },
  browserConfigs: {
    target: null,
    observed: null,
  },
  screenshots: null,
});

const initMDCState = () => ({
  type: "mdc" as const,
  status: {
    target: null,
    observed: null,
  },
  source: {
    target: null,
    observed: null,
  },
  volume: {
    target: null,
    observed: null,
  },
  muted: {
    target: null,
    observed: null,
  },
});

const initPJLinkState = () => ({
  type: "pjlink" as const,
  status: {
    target: null,
    observed: null,
  },
  source: {
    target: null,
    observed: null,
  },
  muted: {
    target: null,
    observed: null,
  },
  audio: {
    target: null,
    observed: null,
  },
  video: {
    target: null,
    observed: null,
  },
});

const initState = () =>
  env.HARDWARE.DEVICES.reduce((acc, device) => {
    switch (device.type) {
      case "node": {
        acc[device.id] = initNodeState();
        break;
      }
      case "mdc": {
        acc[device.id] = initMDCState();
        break;
      }
      case "pjlink": {
        acc[device.id] = initPJLinkState();
        break;
      }
    }
    return acc;
  }, {} as State);

let worker: Worker | null = null;
let state: State = initState();

const reconcile = async () => {
  for (const device of env.HARDWARE.DEVICES) {
    if (device.id in state) continue;
    switch (device.type) {
      case "node": {
        state[device.id] = initNodeState();
        break;
      }
      case "mdc": {
        state[device.id] = initMDCState();
        break;
      }
      case "pjlink": {
        state[device.id] = initPJLinkState();
        break;
      }
    }
  }
  try {
    await new Promise<void>((resolve, reject) => {
      worker = new Worker(path.resolve(__dirname, "worker.cjs"));
      worker.on(
        "message",
        (
          data:
            | { type: "update"; deviceId: string; state: State[keyof State] }
            | { type: "complete" },
        ) => {
          if (data.type === "update") {
            state[data.deviceId] = data.state;
            return;
          }
          resolve();
          worker?.terminate();
        },
      );
      worker.once("error", reject);
      worker.postMessage({
        reconcile: env.RECONCILIATION.STATUS,
        devices: Json.copy(env.HARDWARE.DEVICES),
        state: Json.copy(state),
        type: "init" as const,
      });
    });
    worker = null;
    logger.trace("Completed reconciliation");
  } catch (e) {
    logger.trace(e);
  }
};

let active = true;

const loop = async (handler: () => Promise<void>, intervalMs: number) => {
  while (active) {
    const t0 = Date.now();
    await handler();
    const elapsed = Date.now() - t0;
    const wait = Math.max(0, intervalMs - elapsed);
    await new Promise((resolve) => setTimeout(resolve, wait));
  }
};

const updateState = async <Key extends keyof TBridgeHardwareService>(
  deviceId: string,
  k: Key,
  args: unknown,
) => {
  switch (k) {
    case "mute":
      return { deviceId, key: "muted", args: true };
    case "unmute":
      return { deviceId, key: "muted", args: false };
    case "muteAudio":
      return { deviceId, key: "audio", args: true };
    case "unmuteAudio":
      return { deviceId, key: "audio", args: false };
    case "muteVideo":
      return { deviceId, key: "video", args: true };
    case "unmuteVideo":
      return { deviceId, key: "video", args: false };
    case "setVolume":
      return { deviceId, key: "volume", args };
    case "setSource":
      return { deviceId, key: "source", args };
    case "start":
      return { deviceId, key: "status", args: "on" };
    case "shutdown":
      return { deviceId, key: "status", args: "off" };
    case "openBrowsers":
      return { deviceId, key: "browsers", args: true };
    case "closeBrowsers":
      return { deviceId, key: "browsers", args: false };
    case "setBrowserConfig":
      return { deviceId, key: "browserConfigs", args };
    default:
      return null;
  }
};

export const controller = {
  stop: () => {
    active = false;
  },
  start: () => {
    active = true;
    loop(reconcile, env.RECONCILIATION.TIMEOUT).catch((e) => logger.trace(e));
  },
  getState: () => state,
  reinitialise: () => {
    state = initState();
  },
  update: (deviceId: string, key: string, value: any) => {
    if (worker === null) return;
    const state = updateState(
      deviceId,
      key as keyof TBridgeHardwareService,
      value,
    );
    if (state === null) return;
    worker.postMessage({ type: "update" as const, deviceId, key, value });
  },
  reconcile,
};
