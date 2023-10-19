import { z } from "zod";
import {
  type TDeviceResponse,
  ClientAPITransformSchema,
  type TClientRoutesSchema,
  type TClientRouteInputTransformSchema as TClientRouteInputSchema,
  type TClientRouteOutputTransformSchema as TClientRouteOutputSchema
} from "./client-transform";
import {
  type APIExposureLevel,
  type TServiceRoutesSchema
} from "./service";

export {TDeviceResponse, TClientRouteInputSchema, TClientRouteOutputSchema}

export type TClientExposedRoutes = {
  [Key in keyof TServiceRoutesSchema]: APIExposureLevel<Key> extends "client" ? Key : never
}[keyof TServiceRoutesSchema]

/* Service Types */

export type TClientService = {
  [Key in TClientExposedRoutes]:
  (args: z.infer<TClientRoutesSchema[Key]["args"]>) =>
    Promise<z.infer<TClientRoutesSchema[Key]["client"]>>
};

/* API Types */

export type TClientAPI = {
  [Key in TClientExposedRoutes]: TClientRoutesSchema[Key]
};

/* API */

/**
 * Client API schema, only those that are exposed on the client
 */
export const ClientAPISchema: TClientAPI = Object.fromEntries(Object.entries(ClientAPITransformSchema)
  .filter(([_k, route]) => route.exposed === "client")) as TClientRoutesSchema;

/* Service Utility Types */

/**
 * Arguments to client service function
 */
export type TClientServiceArgs<Key extends keyof TClientService> =
  z.infer<TClientRoutesSchema[Key]["args"]>;

/**
 * Return type of client service function
 */
export type TClientServiceReturns<Key extends keyof TClientService> =
  Promise<z.infer<TClientRoutesSchema[Key]["client"]>>;

export type TClientAPIReturns<Key extends keyof TClientAPI> = Promise<z.infer<TClientAPI[Key]["client"]>>
