import { z } from "zod";
import {
  type TDeviceResponseSchema,
  type TClientRouteSchema,
  type TClientRoutesSchema,
  getDeviceResponseSchema,
  ClientAPITransformSchema,
  type TClientRouteInputTransformSchema,
  type TClientRouteOutputTransformSchema
} from "./client-transform";
import { DeviceIDSchema } from "../hardware";
import { OVEExceptionSchema } from "../ove-types";
import {
  type APIExposureLevel,
  type ExposureLevel,
  type OpenAPIMethod,
  type RouteMethod
} from "./service";

/* Utility Schemas */

/**
 * All bridge routes are wrapped with metadata for identification
 */
export const BridgeMetadataSchema =
  z.object({ bridge: z.string() });
/**
 * Generates multi-device response schema for wrapping with errors
 * @param {z.ZodTypeAny} schema
 * @return {TMultiDeviceResponseSchema}
 */
export const getMultiDeviceResponseSchema =
  <T extends z.ZodTypeAny>(schema: T): TMultiDeviceResponseSchema<T> =>
    z.union([z.array(z.object({
      deviceId: z.string(),
      response: getDeviceResponseSchema(schema)
    })), OVEExceptionSchema]);

/**
 * Generates response schema wrapped with metadata
 * @param {z.ZodTypeAny} schema
 * @return {TBridgeResponseSchema}
 */
export const getBridgeResponseSchema =
  <T extends z.ZodTypeAny>(schema: T): TBridgeResponseSchema<T> =>
    z.object({
      meta: BridgeMetadataSchema,
      response: schema
    });

/* Utility Types */

/**
 * Wraps multiple device responses with errors
 */
export type TMultiDeviceResponseSchema<T extends z.ZodTypeAny> =
  z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
    deviceId: z.ZodString,
    response: TDeviceResponseSchema<T>
  }>>, typeof OVEExceptionSchema]>;

/**
 * Wraps bridge response with metadata
 */
export type TBridgeResponseSchema<T extends z.ZodTypeAny> = z.ZodObject<{
  meta: typeof BridgeMetadataSchema,
  response: T
}>

export type TBridgeResponse<T> = {
  meta: z.infer<typeof BridgeMetadataSchema>
  response: T
}

/* API Route Types */

/**
 * Schema for each single-device route as a type for mapping
 */
export type TBridgeRouteSchema<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> =
  {
    bridge: TBridgeResponseSchema<TClientRouteSchema<A, U, M, E>["client"]>
  }
  & {
  [Key in keyof TClientRouteSchema<A, U, M, E>]:
  TClientRouteSchema<A, U, M, E>[Key]
};

/**
 * Schema for each multi-device route as a type for mapping
 */
export type TBridgeMultiRouteSchema<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> = {
    bridge: TBridgeResponseSchema<
      TMultiDeviceResponseSchema<TClientRouteSchema<A, U, M, E>["returns"]>>
  }
  & {
  [Key in keyof TClientRouteSchema<A, U, M, E>]:
  TClientRouteSchema<A, U, M, E>[Key]
};

/* API Types */

/**
 * All possible single-device routes as schema types.
 */
export type TBridgeSingleRoutesSchema = {
  [Key in keyof TClientRoutesSchema]: TBridgeRouteSchema<z.extendShape<
    TClientRouteInputTransformSchema<Key>, { deviceId: z.ZodString }
  >, TClientRouteOutputTransformSchema<Key>,
    OpenAPIMethod<Key>, APIExposureLevel<Key>>
}

/**
 * All possible multi-device routes as schema types.
 */
export type TBridgeMultiRoutesSchema = {
  [Key in keyof TClientRoutesSchema as `${Key}All`]: TBridgeMultiRouteSchema<
    z.extendShape<
      TClientRouteInputTransformSchema<Key>,
      { tag: z.ZodOptional<z.ZodString> }
    >, TClientRouteOutputTransformSchema<Key>,
    OpenAPIMethod<Key>, APIExposureLevel<Key>>
}

/**
 * All possible routes as schema types.
 */
export type TBridgeRoutesSchema =
  TBridgeSingleRoutesSchema
  & TBridgeMultiRoutesSchema

/* API */

/**
 * Instantiation of the schema above.
 */
export const BridgeAPITransformSchema: TBridgeRoutesSchema =
  Object.entries(ClientAPITransformSchema)
    .reduce((acc, [k, route]) => {
      acc[k] = {
        meta: route.meta,
        returns: route.returns,
        args: route.args.extend({
          deviceId: DeviceIDSchema
        }),
        client: route.client,
        bridge: getBridgeResponseSchema(route.client)
      };
      acc[`${k}All`] = {
        meta: route.meta,
        returns: route.returns,
        args: route.args.extend({
          tag: z.string().optional()
        }),
        client: route.client,
        bridge: getBridgeResponseSchema(
          getMultiDeviceResponseSchema(route.returns))
      };
      return acc;
    }, <{ [key: string]: unknown }>{}) as TBridgeRoutesSchema;

/* API Utility Types */

/**
 * Input schema for a route
 */
export type BridgeRouteInputTransformSchema<
  Key extends keyof TBridgeRoutesSchema> =
  TBridgeRoutesSchema[Key]["args"]["shape"];
/**
 * Output schema for a route
 */
export type BridgeRouteOutputTransformSchema<
  Key extends keyof TBridgeRoutesSchema> = TBridgeRoutesSchema[Key]["returns"];
