import { z } from "zod";
import {
  ClientAPIArgs, ClientAPIExposure, ClientAPIMethod, ClientAPIReturns,
  ClientAPIRoute, ClientAPIRoutes, ClientAPIRoutesType,
  DeviceResponse,
  getDeviceResponseSchema
} from "./client-transform";
import { DeviceIDSchema } from "../hardware";
import { OVEExceptionSchema } from "../ove-types";
import { ExposureLevel, RouteMethod } from "./service";
import { mapObject } from "@ove/ove-utils";

/* Utility Schemas */

export const BridgeMetadataSchema =
  z.object({ bridge: z.string() });
export const getMultiDeviceResponseSchema =
  <T extends z.ZodTypeAny>(schema: T): MultiDeviceResponse<T> =>
    z.union([z.array(z.object({
      deviceId: z.string(),
      response: getDeviceResponseSchema(schema)
    })), OVEExceptionSchema]);

export const getBridgeResponseSchema =
  <T extends z.ZodTypeAny>(schema: T): BridgeResponse<T> => z.object({
    meta: BridgeMetadataSchema,
    bridgeResponse: schema
  });

/* Utility Types */

type MultiDeviceResponse<T extends z.ZodTypeAny> =
  z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
    deviceId: z.ZodString,
    response: DeviceResponse<T>
  }>>, typeof OVEExceptionSchema]>;

type BridgeResponse<T extends z.ZodTypeAny> = z.ZodObject<{
  meta: typeof BridgeMetadataSchema,
  bridgeResponse: T
}>

/* API Route Types */

export type BridgeAPIRoute<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> =
  {
    bridge: BridgeResponse<ClientAPIRoute<A, U, M, E>["client"]>
  }
  & { [Key in keyof ClientAPIRoute<A, U, M, E>]: ClientAPIRoute<A, U, M, E>[Key] };

export type BridgeAPIRouteAll<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> = {
    bridge: BridgeResponse<
      MultiDeviceResponse<ClientAPIRoute<A, U, M, E>["returns"]>>
  }
  & { [Key in keyof ClientAPIRoute<A, U, M, E>]: ClientAPIRoute<A, U, M, E>[Key] };

/* API Type */

export type BridgeAPIRoutesType = {
    [Key in keyof ClientAPIRoutesType]: BridgeAPIRoute<z.extendShape<
      ClientAPIArgs<Key>, { deviceId: z.ZodString }
    >, ClientAPIReturns<Key>, ClientAPIMethod<Key>, ClientAPIExposure<Key>>
  }
  & {
  [Key in keyof ClientAPIRoutesType as `${Key}All`]: BridgeAPIRouteAll<
    z.extendShape<
      ClientAPIArgs<Key>,
      { tag: z.ZodOptional<z.ZodString> }
    >, ClientAPIReturns<Key>, ClientAPIMethod<Key>, ClientAPIExposure<Key>>
};

export const BridgeAPIRoutes: BridgeAPIRoutesType = mapObject(ClientAPIRoutes, (k, route, m) => {
  m[k] = {
    meta: route.meta,
    returns: route.returns,
    args: route.args.extend({deviceId: DeviceIDSchema}),
    client: route.client,
    bridge: getBridgeResponseSchema(route.client),
    exposed: route.exposed
  } as unknown as BridgeAPIRoutesType[typeof k];
  m[`${k}All`] = {
    meta: route.meta,
    returns: route.returns,
    args: route.args.extend({tag: z.string().optional()}),
    client: route.client,
    bridge: getBridgeResponseSchema(getMultiDeviceResponseSchema(route.returns))
  } as unknown as BridgeAPIRoutesType[`${typeof k}All`];
});

/* API Utility Types */

export type BridgeAPIMethod<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["meta"]["openapi"]["method"];
export type BridgeAPIArgs<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["args"]["shape"];
export type BridgeAPIReturns<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["returns"];
export type BridgeAPIExposure<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["exposed"];
