import { objectUtil, z } from "zod";
import {
  BridgeAPITransformSchema,
  type BridgeRouteInputTransformSchema,
  type BridgeRouteOutputTransformSchema,
  type TBridgeSingleRoutesSchema,
  type TBridgeMultiRoutesSchema
} from "./bridge-transform";
import {
  type APIExposureLevel,
  type OpenAPIMethod,
  TServiceRouteSchema,
} from "./service";

/* Utility Types */

/**
 * Converts multi-device route key to single-device route key
 */
export type ToSingleRoute<T> = T extends `${infer R}All` ? R : never

/* API Type */

/**
 * All possible routes as schema types.
 */
export type TCoreRoutesSchema = {
  [Key in keyof TBridgeSingleRoutesSchema]: TServiceRouteSchema<
    objectUtil.MergeShapes<BridgeRouteInputTransformSchema<Key>, {
      bridgeId: z.ZodString
    }>, BridgeRouteOutputTransformSchema<Key>,
    OpenAPIMethod<Key>, APIExposureLevel<Key>>
} & {
  [Key in keyof TBridgeMultiRoutesSchema]: TServiceRouteSchema<
    objectUtil.MergeShapes<BridgeRouteInputTransformSchema<Key>, {
      bridgeId: z.ZodString
    }>,
    BridgeRouteOutputTransformSchema<Key>,
    OpenAPIMethod<ToSingleRoute<Key>>,
    APIExposureLevel<ToSingleRoute<Key>>
  >
}

/* API */

/**
 * Instantiation of the schema type above.
 */
export const CoreAPITransformSchema: TCoreRoutesSchema =
  Object.entries(BridgeAPITransformSchema).reduce((acc, [k, route]) => {
    const optionalPath = `/{bridgeId}${k.includes("All") ? "" : "/{deviceId}"}`;
    const path = route.meta.openapi.path;
    acc[k] = {
      meta: {
        openapi: {
          method: route.meta.openapi.method,
          path: `/hardware${optionalPath}${path}`,
        },
        admin: route.meta.admin,
      },
      returns: route.returns,
      args: route.args.extend({ bridgeId: z.string() }),
      exposed: route.exposed
    };
    return acc;
  }, <{ [key: string]: unknown }>{}) as TCoreRoutesSchema;
