import { z } from "zod";
import { RouteMethod } from "./service";
import {
  BridgeAPIArgs, BridgeAPIMethod, BridgeAPIReturns,
  BridgeAPIRoute,
  BridgeAPIRouteAll, BridgeAPIRoutes,
  BridgeAPIRoutesType
} from "./bridge-transform";
import { BridgeServiceKeys } from "./bridge";

/* API Route Types */

type CoreAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny, M extends RouteMethod> = {
  [Key in keyof BridgeAPIRoute<A, U, M>]: BridgeAPIRoute<A, U, M>[Key]
};

type CoreAPIRouteAll<A extends z.ZodRawShape, U extends z.ZodTypeAny, M extends RouteMethod> = {
  [Key in keyof BridgeAPIRouteAll<A, U, M>]: BridgeAPIRouteAll<A, U, M>[Key]
};

/* API Type */

export type CoreAPIRoutesType = {
  [Key in keyof BridgeAPIRoutesType]:
  BridgeAPIRoutesType[Key] extends BridgeAPIRoute<
    BridgeAPIArgs<Key>,
    BridgeAPIReturns<Key>,
    BridgeAPIMethod<Key>
  > ? CoreAPIRoute<
    z.extendShape<BridgeAPIArgs<Key>, {
      bridgeId: z.ZodString
    }>, BridgeAPIReturns<Key>, BridgeAPIMethod<Key>> : CoreAPIRouteAll<z.extendShape<
    BridgeAPIArgs<Key>,
    { bridgeId: z.ZodString }
  >, BridgeAPIReturns<Key>, BridgeAPIMethod<Key>>
}

/* API */

export const CoreAPIRoutes: CoreAPIRoutesType = (Object.keys(BridgeAPIRoutes) as Array<keyof BridgeAPIRoutesType>).reduce((acc, k) => {
  const optionalPath = `/{bridgeId}${k.includes("All") || (BridgeServiceKeys as string[]).includes(k) ? "" : "/{deviceId}"}`
  const meta = { openapi: { method: BridgeAPIRoutes[k].meta.openapi.method, path: `/hardware${optionalPath}${BridgeAPIRoutes[k].meta.openapi.path}` } }
  return {
    ...acc,
    [k]: {
      meta,
      returns: BridgeAPIRoutes[k].returns,
      args: BridgeAPIRoutes[k].args.extend({ bridgeId: z.string() }),
      client: BridgeAPIRoutes[k].client,
      bridge: BridgeAPIRoutes[k].bridge
    }
  };
}, {} as CoreAPIRoutesType);