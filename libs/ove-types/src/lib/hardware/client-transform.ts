import {
  type APIExposureLevel,
  type ExposureLevel,
  type OpenAPIMethod,
  type RouteMethod,
  type ServiceRouteInputSchema,
  type ServiceRouteOutputSchema,
  type TServiceRouteSchema,
  type TServiceRoutesSchema,
  ServiceAPISchema
} from "./service";
import { z } from "zod";
import { type OVEException, OVEExceptionSchema } from "../ove-types";

/* Utility Types */

/**
 * All client responses are wrapped with an exception
 */
export type TDeviceResponseSchema<T extends z.ZodTypeAny> =
  z.ZodUnion<[T, typeof OVEExceptionSchema]>;

export type TDeviceResponse<T> = T | OVEException

/* Utility Schemas */

/**
 * Generate schema for wrapped response
 * @param {z.ZodTypeAny} schema
 * @return {TDeviceResponseSchema}
 */
export const getDeviceResponseSchema = <T extends z.ZodTypeAny>(
  schema: T
): TDeviceResponseSchema<T> => z.union([schema, OVEExceptionSchema]);

/* API Route Types */

/**
 * Schema for each route as a type for mapping
 */
export type TClientRouteSchema<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> = { client: TDeviceResponseSchema<U>; }
  & {
  [Key in keyof TServiceRouteSchema<A, U, M, E>]:
  TServiceRouteSchema<A, U, M, E>[Key]
};

/* API Type */

/**
 * All possible routes as schema types
 */
export type TClientRoutesSchema = {
  [Key in keyof TServiceRoutesSchema]: TClientRouteSchema<
    ServiceRouteInputSchema<Key>, ServiceRouteOutputSchema<Key>,
    OpenAPIMethod<Key>, APIExposureLevel<Key>>
};

/* API */

/**
 * Instantiation of the schema type above.
 */
export const ClientAPITransformSchema: TClientRoutesSchema =
  Object.entries(ServiceAPISchema)
    .reduce((acc, [k, route]) => {
      acc[k] = {
        meta: route.meta,
        returns: route.returns,
        args: route.args,
        exposed: route.exposed,
        client: getDeviceResponseSchema(route.returns)
      };
      return acc;
    }, <{ [key: string]: unknown }>{}) as TClientRoutesSchema;

/* API Utility Types */

/**
 * Input schema for a route
 */
export type TClientRouteInputTransformSchema<
  Key extends keyof TClientRoutesSchema> =
  TClientRoutesSchema[Key]["args"]["shape"];
/**
 * Output schema for a route
 */
export type TClientRouteOutputTransformSchema<
  Key extends keyof TClientRoutesSchema> = TClientRoutesSchema[Key]["returns"];
