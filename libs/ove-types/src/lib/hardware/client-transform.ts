import {
  type APIExposureLevel,
  type OpenAPIMethod,
  type ServiceRouteInputSchema,
  type ServiceRouteOutputSchema,
  type TServiceRouteSchema,
  type TServiceRoutesSchema,
  ServiceAPISchema
} from "./service";

/* API Type */

/**
 * All possible routes as schema types
 */
export type TClientRoutesSchema = {
  [Key in keyof TServiceRoutesSchema]: TServiceRouteSchema<
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
