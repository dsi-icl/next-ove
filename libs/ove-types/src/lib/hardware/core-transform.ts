import { z } from "zod";
import {
  type TBridgeRouteSchema,
  type TBridgeMultiRouteSchema,
  BridgeAPITransformSchema,
  type BridgeRouteInputTransformSchema,
  type BridgeRouteOutputTransformSchema,
  type TBridgeSingleRoutesSchema,
  type TBridgeMultiRoutesSchema
} from "./bridge-transform";
import {
  type APIExposureLevel,
  type ExposureLevel,
  type OpenAPIMethod,
  type RouteMethod
} from "./service";

/* Utility Types */

/**
 * Converts multi-device route key to single-device route key
 */
export type ToSingleRoute<T> = T extends `${infer R}All` ? R : never

/* API Route Types */

/**
 * Schema for each single-device route as a type for mapping.
 */
type TCoreRouteSchema<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> = {
  [Key in keyof TBridgeRouteSchema<A, U, M, E>]:
  TBridgeRouteSchema<A, U, M, E>[Key]
};

/**
 * Schema for each multi-device route as a type for mapping.
 */
type TCoreMultiRouteSchema<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> = {
  [Key in keyof TBridgeMultiRouteSchema<A, U, M, E>]:
  TBridgeMultiRouteSchema<A, U, M, E>[Key]
};

/* API Type */

/**
 * All possible routes as schema types.
 */
export type TCoreRoutesSchema = {
  [Key in keyof TBridgeSingleRoutesSchema]: TCoreRouteSchema<
    z.extendShape<BridgeRouteInputTransformSchema<Key>, {
      bridgeId: z.ZodString
    }>, BridgeRouteOutputTransformSchema<Key>,
    OpenAPIMethod<Key>, APIExposureLevel<Key>>
} & {
  [Key in keyof TBridgeMultiRoutesSchema]: TCoreMultiRouteSchema<
    z.extendShape<BridgeRouteInputTransformSchema<Key>, {
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
          path: `/hardware${optionalPath}${path}`
        }
      },
      returns: route.returns,
      args: route.args.extend({ bridgeId: z.string() }),
      client: route.client,
      bridge: route.bridge,
      exposed: route.exposed
    };
    return acc;
  }, <{ [key: string]: unknown }>{}) as TCoreRoutesSchema;
