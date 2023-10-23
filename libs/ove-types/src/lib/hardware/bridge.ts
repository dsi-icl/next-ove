import { z } from "zod";
import { type Device, type Optional } from "../hardware";
import {
  type TBridgeRoutesSchema,
} from "./bridge-transform";
import { ClientAPITransformSchema, type TClientRoutesSchema } from "./client-transform";

/* API Keys */

/**
 * Keys of all routes
 */
export const BridgeServiceKeys: readonly (keyof TClientRoutesSchema)[] = Object.keys(ClientAPITransformSchema) as Array<keyof TClientRoutesSchema>;

/* API Types */

export { type TBridgeRoutesSchema, type TBridgeResponseSchema } from "./bridge-transform";

/**
 * Bridge service type
 */
export type TBridgeHardwareService = {
  [Key in keyof TClientRoutesSchema]?: (
    device: Device,
    args: z.infer<TClientRoutesSchema[Key]["args"]>
  ) => Promise<Optional<z.infer<TClientRoutesSchema[Key]["client"]>>>
};

/**
 * Cloud -> observatory events
 */
export type THardwareServerToClientEvents = {
  [Key in keyof TBridgeRoutesSchema]: (
    args: z.infer<TBridgeRoutesSchema[Key]["args"]>,
    callback: (response: z.infer<TBridgeRoutesSchema[Key]["bridge"]>) => void
  ) => void
};

/**
 * Observatory -> cloud events
 */
export type THardwareClientToServerEvents = Record<string, unknown>;

/* API Utility Types */

/**
 * Arguments for bridge service function
 */
export type TBridgeServiceArgs<Key extends keyof TBridgeHardwareService> =
  z.infer<TClientRoutesSchema[Key]["args"]>;
