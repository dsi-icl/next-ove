import {
  excludeKeys,
  type TAPIRoutes,
  type TBridgeController
} from "@ove/ove-types";
import { service } from "./service";
import { env } from "../../../../env";
import { assert } from "@ove/ove-utils";

const wrap = <T>(x: T) => ({
  meta: { bridge: assert(env.BRIDGE_NAME) },
  response: x
});

export const controller: TBridgeController = Object.entries(service)
  .reduce((acc, [k, route]) => {
    if (excludeKeys.includes(k as keyof TAPIRoutes)) return acc;
    acc[k] = async (args: Parameters<typeof route>[0]) => {
      // @ts-expect-error - arg spread
      const res = await route(args);
      return wrap(res);
    };
    return acc;
  }, <{ [key: string]: unknown }>{}) as TBridgeController;
