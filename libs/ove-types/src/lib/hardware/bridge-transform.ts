import { objectUtil, z } from "zod";
import {
  ClientAPITransformSchema,
  type TClientRouteInputTransformSchema,
  type TClientRouteOutputTransformSchema,
  type TClientRoutesSchema,
} from "./client-transform";
import { DeviceIDSchema } from "../hardware";
import {
  type APIExposureLevel,
  type OpenAPIMethod,
  TServiceRouteSchema,
} from "./service"; /* Utility Schemas */

/* Utility Schemas */

/**
 * Generates multi-device response schema for wrapping with errors
 * @param {z.ZodTypeAny} schema
 * @return {TMultiDeviceResponseSchema}
 */
export const getMultiDeviceResponseSchema = <T extends z.ZodTypeAny>(
  schema: T,
): TMultiDeviceResponseSchema<T> =>
  z.strictObject({
    deviceId: z.string(),
    response: schema,
  }).array();

/* Utility Types */

/**
 * Wraps multiple device responses with errors
 */
export type TMultiDeviceResponseSchema<T extends z.ZodTypeAny> = z.ZodArray<
  z.ZodObject<{
    deviceId: z.ZodString;
    response: T;
  }>
>

/* API Types */

/**
 * All possible single-device routes as schema types.
 */
export type TBridgeSingleRoutesSchema = {
  [Key in keyof TClientRoutesSchema]: TServiceRouteSchema<
    objectUtil.MergeShapes<
      TClientRouteInputTransformSchema<Key>,
      { deviceId: z.ZodString }
    >,
    TClientRouteOutputTransformSchema<Key>,
    OpenAPIMethod<Key>,
    APIExposureLevel<Key>
  >;
};

/**
 * All possible multi-device routes as schema types.
 */
export type TBridgeMultiRoutesSchema = {
  [Key in keyof TClientRoutesSchema as `${Key}All`]: TServiceRouteSchema<
    objectUtil.MergeShapes<
      TClientRouteInputTransformSchema<Key>,
      {
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
        deviceIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
      }
    >,
    TMultiDeviceResponseSchema<z.ZodDiscriminatedUnion<"status", [z.ZodObject<{ status: z.ZodLiteral<"success">, data: TClientRouteOutputTransformSchema<Key> }>, z.ZodObject<{status: z.ZodLiteral<"error">, error: z.ZodString}>]>>,
    OpenAPIMethod<Key>,
    APIExposureLevel<Key>
  >;
};

/**
 * All possible routes as schema types.
 */
export type TBridgeRoutesSchema = TBridgeSingleRoutesSchema &
  TBridgeMultiRoutesSchema;

/* API */

/**
 * Instantiation of the schema above.
 */
export const BridgeAPITransformSchema: TBridgeRoutesSchema = Object.entries(
  ClientAPITransformSchema,
).reduce(
  (acc, [k, route]) => {
    acc[k] = {
      meta: route.meta,
      returns: route.returns,
      args: route.args.extend({
        deviceId: DeviceIDSchema,
      }),
    };
    acc[`${k}All`] = {
      meta: route.meta,
      returns: getMultiDeviceResponseSchema(route.returns),
      args: route.args.extend({
        tags: z.string().array().optional(),
        deviceIds: z.string().array().optional(),
      }),
    };
    return acc;
  },
  <{ [key: string]: unknown }>{},
) as TBridgeRoutesSchema;

/* API Utility Types */

/**
 * Input schema for a route
 */
export type BridgeRouteInputTransformSchema<
  Key extends keyof TBridgeRoutesSchema,
> = TBridgeRoutesSchema[Key]["args"]["shape"];
/**
 * Output schema for a route
 */
export type BridgeRouteOutputTransformSchema<
  Key extends keyof TBridgeRoutesSchema,
> = TBridgeRoutesSchema[Key]["returns"];
