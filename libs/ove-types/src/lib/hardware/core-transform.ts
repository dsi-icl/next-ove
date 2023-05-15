import { z } from "zod";
import { ExposureLevel, RouteMethod } from "./service";
import {
  BridgeAPIArgs, BridgeAPIExposure, BridgeAPIMethod, BridgeAPIReturns,
  BridgeAPIRoute,
  BridgeAPIRouteAll, BridgeAPIRoutes,
  BridgeAPIRoutesType
} from "./bridge-transform";
import { BridgeServiceKeys } from "./bridge";

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

export const CoreAPIRoutes: CoreAPIRoutesType =
  (Object.keys(BridgeAPIRoutes) as Array<keyof BridgeAPIRoutesType>)
    .reduce((acc, k) => {
      const optionalPath = `/{bridgeId}${k.includes("All") ||
      (BridgeServiceKeys as string[]).includes(k) ? "" : "/{deviceId}"}`;
      const path = BridgeAPIRoutes[k].meta.openapi.path;
      const meta = {
        openapi: {
          method: BridgeAPIRoutes[k].meta.openapi.method,
          path: `/hardware${optionalPath}${path}`
        }
      };
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
