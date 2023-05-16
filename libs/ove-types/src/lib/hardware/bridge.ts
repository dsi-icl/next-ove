import { z } from "zod";
import { Device, Optional } from "../hardware";
import {
  BridgeAPIRoutesType,
  BridgeOnlyAPIRoutes,
  BridgeOnlyAPIRoutesType
} from "./bridge-transform";
import { ClientAPIRoutes, ClientAPIRoutesType } from "./client-transform";

/* API Keys */

export type BridgeServiceKeysType = keyof BridgeOnlyAPIRoutesType;
export const BridgeServiceKeys: readonly BridgeServiceKeysType[] = Object.keys(BridgeOnlyAPIRoutes) as Array<BridgeServiceKeysType>;

export const DeviceServiceKeys: readonly (keyof ClientAPIRoutesType)[] = Object.keys(ClientAPIRoutes) as Array<keyof ClientAPIRoutesType>;

/* API Type */

export { type BridgeAPIRoutesType as BridgeAPIType } from "./bridge-transform";

export type DeviceService = {
  [Key in keyof ClientAPIRoutesType]?: (
    device: Device,
    args: z.infer<ClientAPIRoutesType[Key]["args"]>
  ) => Promise<Optional<z.infer<ClientAPIRoutesType[Key]["client"]>>>
};

export type BridgeService = {
  [Key in BridgeServiceKeysType]: (
    args: z.infer<BridgeAPIRoutesType[Key]["args"]>,
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
  z.infer<BridgeOnlyAPIRoutesType[Key]["args"]>;
export type DeviceServiceArgs<Key extends keyof DeviceService> =
  z.infer<ClientAPIRoutesType[Key]["args"]>;
