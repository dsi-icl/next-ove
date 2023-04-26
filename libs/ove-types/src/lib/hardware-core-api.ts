import { z } from "zod";
import {
  BridgeAPIRoute,
  BridgeAPIRouteAll, BridgeAPIRoutes,
  BridgeAPIRoutesType
} from "./hardware-bridge-api";

/* API Route Types */

type CoreAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  [Key in keyof BridgeAPIRoute<A, U>]: BridgeAPIRoute<A, U>[Key]
};

type CoreAPIRouteAll<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  [Key in keyof BridgeAPIRouteAll<A, U>]: BridgeAPIRouteAll<A, U>[Key]
};

type CoreAPIRoutesType = {
  [Key in keyof BridgeAPIRoutesType]:
  BridgeAPIRoutesType[Key] extends BridgeAPIRoute<
    BridgeAPIRoutesType[Key]["args"]["shape"],
    BridgeAPIRoutesType[Key]["returns"]
  > ? CoreAPIRoute<
    z.extendShape<BridgeAPIRoutesType[Key]["args"]["shape"], {
      bridgeId: z.ZodString
    }>, BridgeAPIRoutesType[Key]["returns"]> : CoreAPIRouteAll<z.extendShape<
    BridgeAPIRoutesType[Key]["args"]["shape"],
    { bridgeId: z.ZodString }
  >, BridgeAPIRoutesType[Key]["returns"]>
}

/* API */

export const CoreAPIRoutes: CoreAPIRoutesType = (Object.keys(BridgeAPIRoutes) as Array<keyof BridgeAPIRoutesType>).reduce((acc, k) => {
  return {
    ...acc,
    [k]: {
      returns: BridgeAPIRoutes[k].returns,
      args: BridgeAPIRoutes[k].args.extend({ bridgeId: z.string() }),
      client: BridgeAPIRoutes[k].client,
      bridge: BridgeAPIRoutes[k].bridge
    }
  };
}, {} as CoreAPIRoutesType);