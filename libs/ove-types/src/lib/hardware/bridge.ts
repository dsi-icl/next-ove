import { z } from "zod";
import { Device, Optional } from "@ove/ove-types";
import { ClientAPIKeys } from "./client";
import { BridgeAPIRoutesType } from "./bridge-transform";
import { ServiceAPIRoutesType } from "./service";
import { ClientAPIRoutesType } from "./client-transform";

/* API Keys */

type BridgeServiceKeys = keyof Pick<ServiceAPIRoutesType, "getDevice" | "getDevices" | "addDevice" | "removeDevice">;
export const BridgeServiceKeys: readonly BridgeServiceKeys[] = ["getDevice", "getDevices", "addDevice", "removeDevice"] as const;

type DeviceServiceKeys = keyof Pick<ServiceAPIRoutesType, "start" | "setSource" | "setVolume" | "mute" | "unmute" | "muteAudio" | "unmuteAudio" | "muteVideo" | "unmuteVideo">;
export const DeviceServiceKeys: readonly DeviceServiceKeys[] = ["start", "setSource", "setVolume", "mute", "unmute", "muteAudio", "unmuteAudio", "muteVideo", "unmuteVideo"] as const;

/* API Type */

export { type BridgeAPIRoutesType as BridgeAPIType } from "./bridge-transform";

export type DeviceService = {
  [Key in ClientAPIKeys]?: (
    device: Device,
    args: z.infer<ClientAPIRoutesType[Key]["args"]>
  ) => Promise<Optional<z.infer<ClientAPIRoutesType[Key]["client"]>>>
} & {
  [Key in DeviceServiceKeys]?: (
    device: Device,
    args: z.infer<ClientAPIRoutesType[Key]["args"]>
  ) => Promise<Optional<z.infer<ClientAPIRoutesType[Key]["client"]>>>
};

export type BridgeService = {
  [Key in BridgeServiceKeys]: (
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

export type BridgeServiceArgs<Key extends keyof BridgeService> = z.infer<BridgeAPIRoutesType[Key]["args"]>;
export type DeviceServiceArgs<Key extends keyof DeviceService> = z.infer<BridgeAPIRoutesType[Key]["args"]>;