import { service } from "./service";
import { env } from "../../../../env";
import { assert } from "@ove/ove-utils";
import { type TBridgeController } from "@ove/ove-types";

const wrap = <T>(x: T) => ({meta: {bridge: assert(env.BRIDGE_NAME)}, response: x});

export const controller: TBridgeController = Object.entries(service).reduce((acc, [k, route]) => {
  acc[k] = async (args: Parameters<typeof route>[0]) => {
    // @ts-ignore
    const res = await route(args);
    return wrap(res);
  };
  return acc;
}, <{[key: string]: unknown}>{}) as TBridgeController;