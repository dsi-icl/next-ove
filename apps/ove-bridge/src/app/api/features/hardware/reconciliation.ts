/* global NodeJS, setInterval, clearInterval */

import {
  type Device,
  isError,
  type MDCSources,
  type PJLinkSource,
  type StatusOptions,
  type TBridgeHardwareService
} from "@ove/ove-types";
import MDCService from "./mdc-service";
import NodeService from "./node-service";
import PJLinkService from "./pjlink-service";
import { env, logger } from "../../../../env";
import { assert, recordEquals } from "@ove/ove-utils";

type Reconciliation<StateType> = {
  [K in Extract<keyof StateType, `reconcile${string}`>]: NodeJS.Timeout | null
}

type NodeState = {
  status: StatusOptions
  reconcileStatus: NodeJS.Timeout | null
  browsers: boolean | null
  reconcileBrowsers: NodeJS.Timeout | null
  windowConfig: Record<string, string> | null
  reconcileWindowConfig: NodeJS.Timeout | null
}

type MDCState = {
  status: StatusOptions
  reconcileStatus: NodeJS.Timeout | null
  source: keyof MDCSources
  reconcileSource: NodeJS.Timeout | null
  volume: number
  reconcileVolume: NodeJS.Timeout | null
  isMuted: boolean
  reconcileIsMuted: NodeJS.Timeout | null
}

type PJLinkState = {
  status: StatusOptions
  reconcileStatus: NodeJS.Timeout | null
  source: keyof PJLinkSource
  reconcileSource: NodeJS.Timeout | null
  isMuted: boolean
  reconcileIsMuted: NodeJS.Timeout | null
  isAudioMuted: boolean
  reconcileIsAudioMuted: NodeJS.Timeout | null
  isVideoMuted: boolean
  reconcileIsVideoMuted: NodeJS.Timeout | null
}

const initialNodeState: NodeState = {
  status: "on",
  reconcileStatus: null,
  browsers: null,
  reconcileBrowsers: null,
  windowConfig: null,
  reconcileWindowConfig: null
};

const initialMDCState: MDCState = {
  status: "on",
  reconcileStatus: null,
  source: "DP",
  reconcileSource: null,
  volume: 0,
  reconcileVolume: null,
  isMuted: false,
  reconcileIsMuted: null
};

const initialPJLinkState: PJLinkState = {
  status: "off",
  reconcileStatus: null,
  source: "VIDEO",
  reconcileSource: null,
  isMuted: false,
  reconcileIsMuted: null,
  isAudioMuted: false,
  reconcileIsAudioMuted: null,
  isVideoMuted: false,
  reconcileIsVideoMuted: null
};

const initState = () => {
  state.clear();
  env.HARDWARE.forEach(device => {
    switch (device.type) {
      case "node":
        state.set(device.id, initialNodeState);
        break;
      case "mdc":
        state.set(device.id, initialMDCState);
        break;
      case "pjlink":
        state.set(device.id, initialPJLinkState);
        break;
    }
  });
};

export const state: Map<string, NodeState | PJLinkState | MDCState> = new Map();
initState();

export const updateState = async <Key extends keyof TBridgeHardwareService>(
  device: Device,
  k: Key,
  args: unknown
) => {
  switch (k) {
    case "mute": {
      const deviceState = state.get(device.id) as MDCState | PJLinkState;
      deviceState.isMuted = true;
      state.set(device.id, { ...deviceState });
      break;
    }
    case "unmute": {
      const deviceState = state.get(device.id) as MDCState | PJLinkState;
      deviceState.isMuted = false;
      state.set(device.id, { ...deviceState });
      break;
    }
    case "muteAudio": {
      const deviceState = state.get(device.id) as PJLinkState;
      deviceState.isAudioMuted = true;
      state.set(device.id, { ...deviceState });
      break;
    }
    case "unmuteAudio": {
      const deviceState = state.get(device.id) as PJLinkState;
      deviceState.isAudioMuted = false;
      state.set(device.id, { ...deviceState });
      break;
    }
    case "muteVideo": {
      const deviceState = state.get(device.id) as PJLinkState;
      deviceState.isVideoMuted = true;
      state.set(device.id, { ...deviceState });
      break;
    }
    case "unmuteVideo": {
      const deviceState = state.get(device.id) as PJLinkState;
      deviceState.isVideoMuted = false;
      state.set(device.id, { ...deviceState });
      break;
    }
    case "setVolume": {
      const deviceState = state.get(device.id) as MDCState;
      deviceState.volume = (args as { volume: number }).volume;
      state.set(device.id, { ...deviceState });
      break;
    }
    case "setSource": {
      const deviceState = state.get(device.id) as MDCState | PJLinkState;
      deviceState.source = (args as keyof PJLinkSource | keyof MDCSources);
      state.set(device.id, { ...deviceState });
      break;
    }
    case "start": {
      const deviceState = assert(state.get(device.id));
      deviceState.status = "on";
      state.set(device.id, { ...deviceState });
      break;
    }
    case "shutdown": {
      const deviceState = assert(state.get(device.id));
      deviceState.status = "off";
      state.set(device.id, { ...deviceState });
      break;
    }
    case "openBrowsers": {
      const deviceState = state.get(device.id) as NodeState;
      deviceState.browsers = true;
      state.set(device.id, { ...deviceState });
      break;
    }
    case "closeBrowsers": {
      const deviceState = state.get(device.id) as NodeState;
      deviceState.browsers = false;
      state.set(device.id, { ...deviceState });
      break;
    }
  }
};

let interval: NodeJS.Timeout | null = null;

const clearOptionalInterval = (interval: NodeJS.Timeout | null) => {
  if (interval === null) return;
  clearInterval(interval);
};

const reconcileStatus = async (
  target: StatusOptions,
  device: Device,
  service: TBridgeHardwareService
) => {
  const currentStatus = await service.getStatus?.(device, {});
  if (currentStatus !== target) {
    if (currentStatus === "off") {
      await service.start?.(device, {});
    } else {
      await service.shutdown?.(device, {});
    }
  } else {
    const desiredState = assert(state.get(device.id));
    if (desiredState.reconcileStatus === null) {
      return;
    }
    clearInterval(desiredState.reconcileStatus);
    state.set(device.id, { ...desiredState, reconcileStatus: null });
  }
};

const reconcileSource = async (
  target: keyof MDCSources | keyof PJLinkSource,
  device: Device,
  service: TBridgeHardwareService
) => {
  const currentSource = await service.getInfo?.(device, {}) as {
    source: keyof MDCSources | keyof PJLinkSource
  };
  if (currentSource.source !== target) {
    await service.setSource?.(device, { source: target });
  } else {
    const desiredState = state.get(device.id) as MDCState | PJLinkState;
    if (desiredState.reconcileSource === null) {
      return;
    }
    clearInterval(desiredState.reconcileSource);
    state.set(device.id, { ...desiredState, reconcileSource: null });
  }
};

const reconcileBrowsers = async (
  target: boolean | null,
  device: Device,
  service: TBridgeHardwareService
) => {
  if (target === null) return;
  const currentBrowsers = await service.getBrowsers?.(device, {});
  const windowConfig = await service.getWindowConfig?.(device, {});
  if (currentBrowsers === undefined || isError(currentBrowsers) ||
    windowConfig === undefined || isError(windowConfig)) {
    throw new Error(`Error on client ${device.id}`);
  }
  if (target && !recordEquals(currentBrowsers, windowConfig)) {
    await service.openBrowsers?.(device, {});
  } else if (!target && (typeof currentBrowsers === "object" &&
    Object.keys(currentBrowsers).length !== 0)) {
    await service.closeBrowsers?.(device, {});
  } else {
    const desiredState = state.get(device.id) as NodeState;
    if (desiredState.reconcileBrowsers === null) return;
    clearInterval(desiredState.reconcileBrowsers);
    state.set(device.id, { ...desiredState, reconcileBrowsers: null });
  }
};

const reconcileWindowConfig = async (
  target: Record<string, string> | null,
  device: Device,
  service: TBridgeHardwareService
) => {
  if (target === null) return;
  const current = await service.getWindowConfig?.(device, {});
  if (current === undefined || isError(current) ||
    !recordEquals(target, current)) {
    await service.setWindowConfig?.(device, { config: target });
  } else {
    const desiredState = state.get(device.id) as NodeState;
    if (desiredState.reconcileWindowConfig === null) return;
    clearInterval(desiredState.reconcileWindowConfig);
    state.set(device.id, { ...desiredState, reconcileWindowConfig: null });
  }
};

const reconcileIsMuted = async (
  target: boolean,
  device: Device,
  service: TBridgeHardwareService
) => {
  const currentValue = await service.getInfo?.(device, {}) as {
    isMuted: boolean
  };
  if (currentValue.isMuted === target) {
    const desiredState = state.get(device.id) as MDCState | PJLinkState;
    if (desiredState.reconcileIsMuted === null) {
      return;
    }
    clearInterval(desiredState.reconcileIsMuted);
    state.set(device.id, { ...desiredState, reconcileIsMuted: null });
    return;
  }

  if (target) {
    await service.mute?.(device, {});
  } else {
    await service.unmute?.(device, {});
  }
};

const reconcileVolume = async (
  target: number,
  device: Device,
  service: TBridgeHardwareService
) => {
  const current = await service.getInfo?.(device, {}) as { volume: number };
  if (current.volume === target) {
    const desiredState = state.get(device.id) as MDCState;
    if (desiredState.reconcileVolume === null) {
      return;
    }
    clearInterval(desiredState.reconcileVolume);
    state.set(device.id, { ...desiredState, reconcileVolume: null });
    return;
  }
  await service.setVolume?.(device, { volume: target });
};

const reconcileIsAudioMuted = async (
  target: boolean,
  device: Device,
  service: TBridgeHardwareService
) => {
  const current = await service.getInfo?.(device, {}) as {
    isAudioMuted: boolean
  };
  if (current.isAudioMuted === target) {
    const desiredState = state.get(device.id) as PJLinkState;
    if (desiredState.reconcileIsAudioMuted === null) {
      return;
    }
    clearInterval(desiredState.reconcileIsAudioMuted);
    state.set(device.id, { ...desiredState, reconcileIsAudioMuted: null });
    return;
  }
  if (target) {
    await service.muteAudio?.(device, {});
  } else {
    await service.unmuteAudio?.(device, {});
  }
};

const reconcileIsVideoMuted = async (
  target: boolean,
  device: Device,
  service: TBridgeHardwareService
) => {
  const current = await service.getInfo?.(device, {}) as {
    isVideoMuted: boolean
  };
  if (current.isVideoMuted === target) {
    const desiredState = state.get(device.id) as PJLinkState;
    if (desiredState.reconcileIsVideoMuted === null) {
      return;
    }
    clearInterval(desiredState.reconcileIsVideoMuted);
    state.set(device.id, { ...desiredState, reconcileIsVideoMuted: null });
    return;
  }
  if (target) {
    await service.muteVideo?.(device, {});
  } else {
    await service.unmuteVideo?.(device, {});
  }
};

const reconcileDevice = async (device: Device) => {
  const desiredState = assert(state.get(device.id));
  const reconciliation = Object.keys(desiredState).reduce((acc, k) => {
    if (!k.startsWith("reconcile")) return acc;
    clearOptionalInterval(desiredState[k as
      keyof Reconciliation<typeof desiredState>] as NodeJS.Timeout);
    acc[k as keyof Reconciliation<typeof desiredState>] = null;
    return acc;
  }, {} as Reconciliation<typeof desiredState>);

  switch (device.type) {
    case "node":
      await reconcileNode(device, desiredState as NodeState,
        reconciliation as Reconciliation<NodeState>);
      break;
    case "mdc":
      await reconcileMDC(device, desiredState as MDCState,
        reconciliation as Reconciliation<MDCState>);
      break;
    case "pjlink":
      await reconcilePJLink(device, desiredState as PJLinkState,
        reconciliation as Reconciliation<PJLinkState>);
      break;
  }

  state.set(device.id, { ...desiredState, ...reconciliation });
};

const reconcileNode = async (
  device: Device,
  desiredState: NodeState,
  reconciliation: Reconciliation<NodeState>
) => {
  const currentState = {
    status: await NodeService.getStatus?.(device, {}),
    browsers: await NodeService.getBrowsers?.(device, {}),
    windowConfig: await NodeService.getWindowConfig?.(device, {})
  };

  if (currentState.status !== desiredState.status) {
    reconciliation.reconcileStatus = setInterval(
      () => reconcileStatus(
        desiredState.status, device, NodeService),
      env.RECONCILIATION_ERROR_TIMEOUT);
  }

  const browsers = isError(currentState.browsers) ? 0 :
    Object.keys(currentState.browsers ?? {}).length;

  if (desiredState.browsers !== null &&
    (desiredState.browsers && browsers <= 0 ||
      !desiredState.browsers && browsers !== 0)) {
    reconciliation.reconcileBrowsers = setInterval(
      () => reconcileBrowsers(
        desiredState.browsers, device, NodeService),
      env.RECONCILIATION_ERROR_TIMEOUT
    );
  }

  if (desiredState.windowConfig !== null &&
    (isError(currentState.windowConfig) ||
      currentState.windowConfig === undefined ||
      !recordEquals(currentState.windowConfig, desiredState.windowConfig))) {
    reconciliation.reconcileWindowConfig = setInterval(
      () => reconcileWindowConfig(
        desiredState.windowConfig, device, NodeService),
      env.RECONCILIATION_ERROR_TIMEOUT);
  }
};

const reconcileMDC = async (
  device: Device,
  desiredState: MDCState,
  reconciliation: Reconciliation<MDCState>
) => {
  const currentState = await MDCService.getStatus?.(device, {});
  const currentInfo = await MDCService.getInfo?.(device, {}) as {
    source: keyof MDCSources
    isMuted: boolean
    volume: number
  };

  if (currentState !== desiredState.status) {
    reconciliation.reconcileStatus = setInterval(() =>
      reconcileStatus(desiredState.status, device, MDCService), env.RECONCILIATION_ERROR_TIMEOUT);
  }
  if (currentInfo.source !== desiredState.source) {
    reconciliation.reconcileSource = setInterval(() =>
      reconcileSource(desiredState.source, device, MDCService), env.RECONCILIATION_ERROR_TIMEOUT);
  }
  if (currentInfo.isMuted !== desiredState.isMuted) {
    reconciliation.reconcileIsMuted = setInterval(() =>
      reconcileIsMuted(desiredState.isMuted, device, MDCService), env.RECONCILIATION_ERROR_TIMEOUT);
  }
  if (currentInfo.volume !== desiredState.volume) {
    reconciliation.reconcileVolume = setInterval(() =>
      reconcileVolume(desiredState.volume, device, MDCService), env.RECONCILIATION_ERROR_TIMEOUT);
  }
};

const reconcilePJLink = async (
  device: Device,
  desiredState: PJLinkState,
  reconciliation: Reconciliation<PJLinkState>
) => {
  const currentState = await PJLinkService.getStatus?.(device, {});
  if (currentState !== desiredState.status) {
    reconciliation.reconcileStatus = setInterval(() =>
      reconcileStatus(desiredState.status, device, PJLinkService));
  }

  const currentSource = await PJLinkService.getInfo?.(device, {}) as {
    source: keyof PJLinkSource
    isMuted: boolean
    isAudioMuted: boolean
    isVideoMuted: boolean
  };
  if (currentSource.source !== desiredState.source) {
    reconciliation.reconcileSource = setInterval(() =>
      reconcileSource(desiredState.source, device, PJLinkService), env.RECONCILIATION_ERROR_TIMEOUT);
  }

  if (currentSource.isMuted !== desiredState.isMuted) {
    reconciliation.reconcileIsMuted = setInterval(() =>
      reconcileIsMuted(desiredState.isMuted, device, PJLinkService), env.RECONCILIATION_ERROR_TIMEOUT);
  }

  if (currentSource.isAudioMuted !== desiredState.isAudioMuted) {
    reconciliation.reconcileIsAudioMuted = setInterval(() =>
      reconcileIsAudioMuted(desiredState.isAudioMuted, device,
        PJLinkService), env.RECONCILIATION_ERROR_TIMEOUT);
  }

  if (currentSource.isVideoMuted !== desiredState.isVideoMuted) {
    reconciliation.reconcileIsVideoMuted = setInterval(() =>
      reconcileIsVideoMuted(desiredState.isVideoMuted, device,
        PJLinkService), env.RECONCILIATION_ERROR_TIMEOUT);
  }
};

const reconcile = () => {
  for (const device of env.HARDWARE) {
    reconcileDevice(device).catch(logger.error);
  }
};

export const startReconciliation = () => {
  logger.info("Start reconciliation");
  reconcile();
  interval = setInterval(async () => {
    reconcile();
  }, env.RECONCILIATION_TIMEOUT);
};

export const refreshReconciliation = () => {
  stopReconciliation();
  initState();
  startReconciliation();
};

export const stopReconciliation = () => {
  logger.info("Stopping reconciliation");
  for (const x of state.values()) {
    if (x.reconcileStatus !== null) {
      clearInterval(x.reconcileStatus);
    }
    x.reconcileStatus = null;
  }
  if (interval === null) return;
  clearInterval(interval);
  interval = null;
};
