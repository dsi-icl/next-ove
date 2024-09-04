import {
  Device, isError, MDCSources, PJLinkSource,
  StatusOptions,
  TBridgeHardwareService
} from "@ove/ove-types";
import { assert, recordEquals } from "@ove/ove-utils";
import { getServiceForProtocol } from "./utils";
import { env } from "../../../../env";

type ReconciliationStateValue<T> = { state: T | null, ac: AbortController }
type ReconciliationStateMember<T> = Map<string, ReconciliationStateValue<T>>

export type ReconciliationState = {
  status: ReconciliationStateMember<StatusOptions>
  browsers: ReconciliationStateMember<boolean | null>
  windows: ReconciliationStateMember<Record<string, string> | null>
  muted: ReconciliationStateMember<boolean>
  audio: ReconciliationStateMember<boolean>
  video: ReconciliationStateMember<boolean>
  volume: ReconciliationStateMember<number>
  source: ReconciliationStateMember<keyof PJLinkSource | keyof MDCSources>
}

const state: ReconciliationState = {
  status: new Map(),
  browsers: new Map(),
  windows: new Map(),
  muted: new Map(),
  audio: new Map(),
  video: new Map(),
  volume: new Map(),
  source: new Map()
};

const init = () => {
  cancel();

  for (const device of env.HARDWARE) {
    for (const key of Object.keys(state)) {
      state[key as keyof ReconciliationState].set(device.id, {state: null, ac: new AbortController()});
    }
  }
};

const update = () => {
  const cur = new Set(state.status.keys());
  const next = new Set(env.HARDWARE.map(({id}) => id));

  // @ts-expect-error TS2339 - missing new Set APIs
  for (const device of cur.difference(next)) {
    for (const key of Object.keys(state)) {
      assert(state[key as keyof ReconciliationState].get(device)).ac.abort();
      state[key as keyof ReconciliationState].delete(device);
    }
  }

  // @ts-expect-error TS2339 - missing new Set APIs
  for (const device of next.difference(cur)) {
    for (const key of Object.keys(state)) {
      state[key as keyof ReconciliationState].set(device, {state: null, ac: new AbortController()});
    }
  }
};

const updateState = async <Key extends keyof TBridgeHardwareService>(
  device: Device,
  k: Key,
  args: unknown
) => {
  switch (k) {
    case "mute": {
      assert(state.muted.get(device.id)).ac.abort();
      state.muted.set(device.id, { state: true, ac: new AbortController() });
      break;
    }
    case "unmute": {
      assert(state.muted.get(device.id)).ac.abort();
      state.muted.set(device.id, {
        state: false,
        ac: new AbortController()
      });
      break;
    }
    case "muteAudio": {
      assert(state.audio.get(device.id)).ac.abort();
      state.audio.set(device.id, {
        state: true,
        ac: new AbortController()
      });
      break;
    }
    case "unmuteAudio": {
      assert(state.audio.get(device.id)).ac.abort();
      state.audio.set(device.id, {
        state: false,
        ac: new AbortController()
      });
      break;
    }
    case "muteVideo": {
      assert(state.video.get(device.id)).ac.abort();
      state.video.set(device.id, {
        state: true,
        ac: new AbortController()
      });
      break;
    }
    case "unmuteVideo": {
      assert(state.video.get(device.id)).ac.abort();
      state.video.set(device.id, {
        state: false,
        ac: new AbortController()
      });
      break;
    }
    case "setVolume": {
      assert(state.volume.get(device.id)).ac.abort();
      state.volume.set(device.id, {
        state: (args as { volume: number }).volume,
        ac: new AbortController()
      });
      break;
    }
    case "setSource": {
      assert(state.source.get(device.id)).ac.abort();
      state.source.set(device.id, {
        state: (args as keyof PJLinkSource | keyof MDCSources),
        ac: new AbortController()
      });
      break;
    }
    case "start": {
      assert(state.status.get(device.id)).ac.abort();
      state.status.set(device.id, {
        state: "on",
        ac: new AbortController()
      });
      break;
    }
    case "shutdown": {
      assert(state.status.get(device.id)).ac.abort();
      state.status.set(device.id, {
        state: "off",
        ac: new AbortController()
      });
      break;
    }
    case "openBrowsers": {
      assert(state.browsers.get(device.id)).ac.abort();
      state.browsers.set(device.id, {
        state: true,
        ac: new AbortController()
      });
      break;
    }
    case "closeBrowsers": {
      assert(state.browsers.get(device.id)).ac.abort();
      state.browsers.set(device.id, {
        state: false,
        ac: new AbortController()
      });
      break;
    }
  }
};

const createAC = <T extends Map<string, {state: StateType<T>, ac: AbortController}>>(device: Device, map: T) => {
  const ac = new AbortController();
  ac.signal.addEventListener("abort", () => {
    map.set(device.id, {state: assert(map.get(device.id)).state, ac: createAC(device, map)});
  }, {once: true});
  return ac;
};

const reconcileStatus = async (device: Device) => {
  const currentState = assert(state.status.get(device.id));
  const service = getServiceForProtocol(device.type);
  const res = await service.getStatus?.(device, {}, getAC.bind(null, device, state.status));
  if (res === currentState.state) return;
  if (res === "off") {
    await service.start?.(device, {}, getAC.bind(null, device, state.status));
  } else {
    await service.shutdown?.(device, {}, getAC.bind(null, device, state.status));
  }
};

type StateType<T> = T extends Map<string, {state: infer R, ac: AbortController}> ? R : never

const getAC = <T extends Map<string, {state: StateType<T>, ac: AbortController}>>(device: Device, map: T) => assert(map.get(device.id)).ac;

const reconcileBrowsers = async (device: Device) => {
  const currentState = assert(state.browsers.get(device.id));
  const service = getServiceForProtocol(device.type);
  const browsers = await service.getBrowsers?.(device, {}, getAC.bind(null, device, state.browsers));
  const windowConfig = await service.getWindowConfig?.(device, {}, getAC.bind(null, device, state.browsers));
  if (browsers === undefined || isError(browsers) ||
    windowConfig === undefined || isError(windowConfig)) {
    throw new Error(`Error on client ${device.id}`);
  }
  if (currentState.state && !recordEquals(browsers, windowConfig)) {
    await service.openBrowsers?.(device, {}, getAC.bind(null, device, state.browsers));
  } else if (!currentState.state && (typeof browsers === "object" &&
    Object.keys(browsers).length !== 0)) {
    await service.closeBrowsers?.(device, {}, getAC.bind(null, device, state.browsers));
  }
};

const reconcileWindowConfig = async (device: Device) => {
  const currentState = assert(state.windows.get(device.id));
  const service = getServiceForProtocol(device.type);
  const windows = await service.getWindowConfig?.(device, {}, getAC.bind(null, device, state.windows));
  if (currentState.state === null || (windows !== undefined && !isError(windows) && recordEquals(currentState.state, windows))) return;
  await service.setWindowConfig?.(device, { config: assert(currentState.state) }, getAC.bind(null, device, state.windows));
};

const reconcileIsMuted = async (device: Device) => {
  const currentState = assert(state.muted.get(device.id));
  const service = getServiceForProtocol(device.type);
  const currentValue = await service.getInfo?.(device, {}, getAC.bind(null, device, state.muted)) as {
    isMuted: boolean
  };
  if (currentValue.isMuted === currentState.state || currentState.state === null) return;

  if (currentState.state) {
    await service.mute?.(device, {}, getAC.bind(null, device, state.muted));
  } else {
    await service.unmute?.(device, {}, getAC.bind(null, device, state.muted));
  }
};

const reconcileVolume = async (device: Device) => {
  const currentState = assert(state.volume.get(device.id));
  const service = getServiceForProtocol(device.type);
  const current = await service.getInfo?.(device, {}, getAC.bind(null, device, state.volume)) as { volume: number };
  if (current.volume === currentState.state || currentState.state === null) return;
  await service.setVolume?.(device, { volume: assert(currentState.state) }, getAC.bind(null, device, state.volume));
};

const reconcileSource = async (device: Device) => {
  const currentState = assert(state.source.get(device.id));
  const service = getServiceForProtocol(device.type);
  const currentSource = await service.getInfo?.(device, {}, getAC.bind(null, device, state.source)) as {
    source: keyof MDCSources | keyof PJLinkSource
  };
  if (currentSource.source === currentState.state || currentState.state === null) return;
    await service.setSource?.(device, { source: assert(currentState.state) }, getAC.bind(null, device, state.source));
};

const reconcileIsAudioMuted = async (device: Device) => {
  const currentState = assert(state.audio.get(device.id));
  const service = getServiceForProtocol(device.type);
  const current = await service.getInfo?.(device, {}, getAC.bind(null, device, state.audio)) as {
    isAudioMuted: boolean
  };
  if (current.isAudioMuted === currentState.state || currentState.state === null) return;
  if (currentState.state) {
    await service.muteAudio?.(device, {}, getAC.bind(null, device, state.audio));
  } else {
    await service.unmuteAudio?.(device, {}, getAC.bind(null, device, state.audio));
  }
};

const reconcileIsVideoMuted = async (device: Device) => {
  const currentState = assert(state.video.get(device.id));
  const service = getServiceForProtocol(device.type);
  const current = await service.getInfo?.(device, {}, getAC.bind(null, device, state.audio)) as {
    isVideoMuted: boolean
  };
  if (current.isVideoMuted === currentState.state || currentState.state === null) return;
  if (currentState.state) {
    await service.muteVideo?.(device, {}, getAC.bind(null, device, state.video));
  } else {
    await service.unmuteVideo?.(device, {}, getAC.bind(null, device, state.video));
  }
};

const cancel = () => {
  for (const key of Object.keys(state)) {
    for (const k of state[key as keyof ReconciliationState].keys()) {
      const { ac } = assert(state[key as keyof ReconciliationState].get(k));
      ac.abort();
    }
  }
};

export const service = {
  reconcileStatus,
  reconcileBrowsers,
  reconcileWindowConfig,
  reconcileIsMuted,
  reconcileVolume,
  reconcileSource,
  reconcileIsAudioMuted,
  reconcileIsVideoMuted,
  updateState,
  init,
  update,
  cancel
};

