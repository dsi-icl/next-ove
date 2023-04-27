import { CoreAPIRoutes, type CoreAPIRoutesType } from "./core-transform";
import { BridgeServiceKeys } from "./bridge";
import {z} from "zod";

/* API Keys */

export type CoreAPIKeys = keyof Omit<CoreAPIRoutesType, "getDeviceAll" | "getDevicesAll" | "addDeviceAll" | "removeDeviceAll">;

/* API Type */

export type CoreAPIType = {
  [Key in CoreAPIKeys]: CoreAPIRoutesType[Key]
};

/* API */

export const CoreAPI = (Object.keys(CoreAPIRoutes) as Array<keyof CoreAPIRoutesType>).reduce((acc, k) => {
  if (BridgeServiceKeys.map(key => `${key}All`).includes(k)) return acc;
  return {
    ...acc,
    [k]: CoreAPIRoutes[k]
  }
}, {} as CoreAPIType);

/* API Utility Types*/

export type CoreAPIMethod<Key extends CoreAPIKeys> = CoreAPIType[Key]["meta"]["openapi"]["method"];
export type CoreAPIReturns<Key extends CoreAPIKeys> = z.infer<CoreAPIType[Key]["bridge"]>;