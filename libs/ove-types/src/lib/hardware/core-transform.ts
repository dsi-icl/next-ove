import { z } from "zod";
import { ExposureLevel, RouteMethod } from "./service";
import {
  BridgeAPIArgs, BridgeAPIExposure, BridgeAPIMethod, BridgeAPIReturns,
  BridgeAPIRoute,
  BridgeAPIRouteAll, BridgeAPIRoutes,
  BridgeAPIRoutesType
} from "./bridge-transform";
import { mapObject2 } from "@ove/ove-utils";

/* API Route Types */

type CoreAPIRoute<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> = {
  [Key in keyof BridgeAPIRoute<A, U, M, E>]: BridgeAPIRoute<A, U, M, E>[Key]
};

type CoreAPIRouteAll<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> = {
  [Key in keyof BridgeAPIRouteAll<A, U, M, E>]: BridgeAPIRouteAll<A, U, M, E>[Key]
};

/* API Type */

export type CoreAPIRoutesType = {
  [Key in keyof BridgeAPIRoutesType]:
  BridgeAPIRoutesType[Key] extends BridgeAPIRoute<
    BridgeAPIArgs<Key>,
    BridgeAPIReturns<Key>,
    BridgeAPIMethod<Key>,
    BridgeAPIExposure<Key>
  > ? CoreAPIRoute<
    z.extendShape<BridgeAPIArgs<Key>, {
      bridgeId: z.ZodString
    }>, BridgeAPIReturns<Key>, BridgeAPIMethod<Key>, BridgeAPIExposure<Key>> : CoreAPIRouteAll<
    z.extendShape<BridgeAPIArgs<Key>, { bridgeId: z.ZodString }>,
    BridgeAPIReturns<Key>,
    BridgeAPIMethod<Key>,
    BridgeAPIExposure<Key>
  >
}

/* API */

export const CoreAPIRoutes: CoreAPIRoutesType = mapObject2(BridgeAPIRoutes, (k, route) => {
  const optionalPath = `/{bridgeId}${(k as string).includes("All") ? "" : "/{deviceId}"}`;
  const path = route.meta.openapi.path;
  return [k, {
    meta: {
      openapi: {
        method: route.meta.openapi.method,
        path: `/hardware${optionalPath}${path}`
      }
    },
    returns: route.returns,
    args: route.args.extend({ bridgeId: z.string() }),
    client: route.client,
    bridge: route.bridge,
    exposed: route.exposed
  } as CoreAPIRoutesType[typeof k]];
});
