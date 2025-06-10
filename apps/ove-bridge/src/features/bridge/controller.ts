import type { TBridgeController } from "@ove/ove-types";
import { env } from "../../env";
import { service } from "./service";

const wrap = <T>(x: T) => ({
  meta: { bridge: env?.AUTH.NAME },
  response: x,
});

export const controller: TBridgeController = Object.entries(service).reduce(
  (acc, [k, route]) => {
    acc[k] = async (args: Parameters<typeof route>[0]) => {
      // @ts-expect-error - arg spread
      const res = await route(args);
      return wrap(res);
    };
    return acc;
  },
  <{ [key: string]: unknown }>{},
) as TBridgeController;
