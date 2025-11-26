import type { TBridgeController } from "@ove/ove-types";
import { service } from "./service";

export const controller: TBridgeController = Object.entries(service).reduce(
  (acc, [k, route]) => {
    acc[k] = (args: Parameters<typeof route>[0]) => {
      // @ts-expect-error - arg spread
      return route(args);
    };
    return acc;
  },
  <{ [key: string]: unknown }>{},
) as TBridgeController;
