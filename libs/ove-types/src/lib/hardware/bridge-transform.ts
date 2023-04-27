import { z } from "zod";
import {
  ClientAPIArgs, ClientAPIMethod, ClientAPIReturns,
  ClientAPIRoute, ClientAPIRoutes, ClientAPIRoutesType,
  DeviceResponse,
  getDeviceResponseSchema
} from "./client-transform";
import { DeviceIDSchema, OVEExceptionSchema } from "@ove/ove-types";
import { RouteMethod } from "./service";

/* Utility Schemas */

export const BridgeMetadataSchema = z.object({ bridge: z.string() });
export const getMultiDeviceResponseSchema = <T extends z.ZodTypeAny>(schema: T): MultiDeviceResponse<T> => z.union([z.array(z.object({
  deviceId: z.string(),
  response: getDeviceResponseSchema(schema)
})), OVEExceptionSchema]);

export const getBridgeResponseSchema = <T extends z.ZodTypeAny>(schema: T): BridgeResponse<T> => {
  return z.object({
    meta: BridgeMetadataSchema,
    bridgeResponse: schema
  });
};

/* Utility Types */

type MultiDeviceResponse<T extends z.ZodTypeAny> = z.ZodUnion<readonly [z.ZodArray<z.ZodObject<{
  deviceId: z.ZodString,
  response: DeviceResponse<T>
}>>, typeof OVEExceptionSchema]>;

type BridgeResponse<T extends z.ZodTypeAny> = z.ZodObject<{
  meta: typeof BridgeMetadataSchema,
  bridgeResponse: T
}>

/* API Route Types */

export type BridgeAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny, M extends RouteMethod> =
  {
    bridge: BridgeResponse<ClientAPIRoute<A, U, M>["client"]>
  }
  & { [Key in keyof ClientAPIRoute<A, U, M>]: ClientAPIRoute<A, U, M>[Key] };

export type BridgeAPIRouteAll<A extends z.ZodRawShape, U extends z.ZodTypeAny, M extends RouteMethod> =
  {
    bridge: BridgeResponse<MultiDeviceResponse<ClientAPIRoute<A, U, M>["returns"]>>
  }
  & { [Key in keyof ClientAPIRoute<A, U, M>]: ClientAPIRoute<A, U, M>[Key] };

/* API Type */

export type BridgeAPIRoutesType = {
    [Key in keyof ClientAPIRoutesType]: BridgeAPIRoute<z.extendShape<ClientAPIArgs<Key>, {
      deviceId: z.ZodString
    }>, ClientAPIReturns<Key>, ClientAPIMethod<Key>>
  }
  & {
  [Key in keyof ClientAPIRoutesType as `${Key}All`]: BridgeAPIRouteAll<z.extendShape<
    ClientAPIArgs<Key>,
    { tag: z.ZodOptional<z.ZodString> }
  >, ClientAPIReturns<Key>, ClientAPIMethod<Key>>
};

/* API */

export const BridgeAPIRoutes: BridgeAPIRoutesType = (Object.keys(ClientAPIRoutes) as Array<keyof ClientAPIRoutesType>).reduce((acc, k) => {
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
      bridge: getBridgeResponseSchema(getMultiDeviceResponseSchema(ClientAPIRoutes[k].client))
    }
  };
}, {} as BridgeAPIRoutesType);

/* API Utility Types */

export type BridgeAPIMethod<Key extends keyof BridgeAPIRoutesType> = BridgeAPIRoutesType[Key]["meta"]["openapi"]["method"];
export type BridgeAPIArgs<Key extends keyof BridgeAPIRoutesType> = BridgeAPIRoutesType[Key]["args"]["shape"];
export type BridgeAPIReturns<Key extends keyof BridgeAPIRoutesType> = BridgeAPIRoutesType[Key]["returns"];