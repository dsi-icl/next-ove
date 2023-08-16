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
    response: schema
  });

/* Utility Types */

type MultiDeviceResponse<T extends z.ZodTypeAny> =
  z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
    deviceId: z.ZodString,
    response: DeviceResponse<T>
  }>>, typeof OVEExceptionSchema]>;

export type BridgeResponse<T extends z.ZodTypeAny> = z.ZodObject<{
  meta: typeof BridgeMetadataSchema,
  response: T
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

type BridgeAPIRoutesTypeSingle = {
  [Key in keyof ClientAPIRoutesType]: BridgeAPIRoute<z.extendShape<
    ClientAPIArgs<Key>, { deviceId: z.ZodString }
  >, ClientAPIReturns<Key>, ClientAPIMethod<Key>, ClientAPIExposure<Key>>
}

type BridgeAPIRoutesTypeMulti = {
  [Key in keyof ClientAPIRoutesType as `${Key}All`]: BridgeAPIRouteAll<
    z.extendShape<
      ClientAPIArgs<Key>,
      { tag: z.ZodOptional<z.ZodString> }
    >, ClientAPIReturns<Key>, ClientAPIMethod<Key>, ClientAPIExposure<Key>>
}

export type BridgeAPIRoutesType = BridgeAPIRoutesTypeSingle & BridgeAPIRoutesTypeMulti

// export const BridgeAPIRoutes: BridgeAPIRoutesType = {...mapObject2<typeof ClientAPIRoutes, BridgeAPIRoutesTypeSingle>(ClientAPIRoutes, (k, route) => {
//   return [k, {
//     meta: route.meta,
//     returns: route.returns,
//     args: route.args.extend({deviceId: DeviceIDSchema}),
//     client: route.client,
//     bridge: getBridgeResponseSchema(route.client),
//     exposed: route.exposed
//   } as unknown as BridgeAPIRoutesType[typeof k]];
// }), ...mapObjectWithKeys<typeof ClientAPIRoutes, BridgeAPIRoutesTypeMulti, keyof BridgeAPIRoutesTypeMulti>(ClientAPIRoutes, (k, route) => {
//   return [`${k}All`, {
//     meta: route.meta,
//     returns: route.returns,
//     args: route.args.extend({tag: z.string().optional()}),
//     client: route.client,
//     bridge: getBridgeResponseSchema(getMultiDeviceResponseSchema(route.returns))
//   } as unknown as BridgeAPIRoutesType[`${typeof k}All`]];
// })};

export const BridgeAPIRoutes: BridgeAPIRoutesType =
  (Object.keys(ClientAPIRoutes) as Array<keyof ClientAPIRoutesType>)
    .reduce((acc, k) => {
      return {
        ...acc,
        [k]: {
          meta: ClientAPIRoutes[k].meta,
          returns: ClientAPIRoutes[k].returns,
          args: ClientAPIRoutes[k].args.extend({
            deviceId: DeviceIDSchema
          }),
          client: ClientAPIRoutes[k].client,
          bridge: getBridgeResponseSchema(ClientAPIRoutes[k].client)
        },
        [`${k}All`]: {
          meta: ClientAPIRoutes[k].meta,
          returns: ClientAPIRoutes[k].returns,
          args: ClientAPIRoutes[k].args.extend({
            tag: z.string().optional()
          }),
          client: ClientAPIRoutes[k].client,
          bridge: getBridgeResponseSchema(
            getMultiDeviceResponseSchema(ClientAPIRoutes[k].client))
        }
      };
    }, {} as BridgeAPIRoutesType);

/* API Utility Types */

export type BridgeAPIMethod<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["meta"]["openapi"]["method"];
export type BridgeAPIArgs<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["args"]["shape"];
export type BridgeAPIReturns<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["returns"];
export type BridgeAPIExposure<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["exposed"];
