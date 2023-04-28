import { z } from "zod";
import { Device, Optional } from "../hardware";
import { ClientAPIKeysType } from "./client";
import { BridgeAPIRoutesType } from "./bridge-transform";
import { ServiceAPIRoutesType } from "./service";
import { ClientAPIRoutesType } from "./client-transform";

/* API Keys */

type BridgeServiceKeysType = keyof Pick<ServiceAPIRoutesType,
  "getDevice" | "getDevices" | "addDevice" | "removeDevice">;
export const BridgeServiceKeys: readonly BridgeServiceKeysType[] =
  ["getDevice", "getDevices", "addDevice", "removeDevice"] as const;

type DeviceServiceKeysType = keyof Pick<ServiceAPIRoutesType,
  "start" | "setSource" | "setVolume" | "mute" | "unmute" | "muteAudio" |
  "unmuteAudio" | "muteVideo" | "unmuteVideo">;
export const DeviceServiceKeys: readonly DeviceServiceKeysType[] = [
  "start",
  "setSource",
  "setVolume",
  "mute",
  "unmute",
  "muteAudio",
  "unmuteAudio",
  "muteVideo",
  "unmuteVideo"
] as const;

/* API Type */

export { type BridgeAPIRoutesType as BridgeAPIType } from "./bridge-transform";

export type DeviceService = {
  [Key in ClientAPIKeysType]?: (
    device: Device,
    args: z.infer<ClientAPIRoutesType[Key]["args"]>
  ) => Promise<Optional<z.infer<ClientAPIRoutesType[Key]["client"]>>>
} & {
  [Key in DeviceServiceKeysType]?: (
    device: Device,
    args: z.infer<ClientAPIRoutesType[Key]["args"]>
  ) => Promise<Optional<z.infer<ClientAPIRoutesType[Key]["client"]>>>
};

export type BridgeService = {
  [Key in BridgeServiceKeysType]: (
    args: z.infer<ClientAPIRoutesType[Key]["args"]>,
    callback: (response: z.infer<BridgeAPIRoutesType[Key]["bridge"]>) => void
  ) => void
};

export type HardwareServerToClientEvents = {
  [Key in keyof BridgeAPIRoutesType]: (
    args: z.infer<BridgeAPIRoutesType[Key]["args"]>,
    callback: (response: z.infer<BridgeAPIRoutesType[Key]["bridge"]>) => void
  ) => void
};

export type HardwareClientToServerEvents = Record<string, unknown>;

/* API Utility Types */

export type BridgeServiceArgs<Key extends keyof BridgeService> =
  z.infer<BridgeAPIRoutesType[Key]["args"]>;
export type DeviceServiceArgs<Key extends keyof DeviceService> =
  z.infer<BridgeAPIRoutesType[Key]["args"]>;
