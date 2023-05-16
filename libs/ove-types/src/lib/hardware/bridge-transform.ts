import { z } from "zod";
import {
  ClientAPIArgs, ClientAPIExposure, ClientAPIMethod, ClientAPIReturns,
  ClientAPIRoute, ClientAPIRoutes, ClientAPIRoutesType,
  DeviceResponse,
  getDeviceResponseSchema
} from "./client-transform";
import { DeviceIDSchema, DeviceSchema, StatusSchema } from "../hardware";
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

export type BridgeOnlyAPIRoutesType = {
  getDevice: BridgeAPIRoute<
    { deviceId: z.ZodString },
    typeof DeviceSchema,
    "GET",
    "bridge"
  >
  getDevices: BridgeAPIRoute<
    { tag: z.ZodOptional<z.ZodString> },
    z.ZodArray<typeof DeviceSchema>,
    "GET",
    "bridge"
  >
  addDevice: BridgeAPIRoute<
    { device: typeof DeviceSchema },
    z.ZodBoolean,
    "POST",
    "bridge"
  >
  removeDevice: BridgeAPIRoute<
    { deviceId: z.ZodString },
    z.ZodBoolean,
    "DELETE",
    "bridge"
  >
}

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
} & { [Key in keyof BridgeOnlyAPIRoutesType]: BridgeOnlyAPIRoutesType[Key] };

/* API */

export const BridgeOnlyAPIRoutes: BridgeOnlyAPIRoutesType = {
  getDevice: {
    meta: { openapi: { method: "GET" as const, path: "/device/{deviceId}" } },
    args: z.object({ deviceId: z.string() }).strict(),
    returns: DeviceSchema,
    client: getDeviceResponseSchema(DeviceSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(DeviceSchema)),
    exposed: "bridge"
  },
  getDevices: {
    meta: { openapi: { method: "GET" as const, path: "/devices" } },
    args: z.object({ tag: z.string().optional() }).strict(),
    returns: z.array(DeviceSchema),
    client: getDeviceResponseSchema(z.array(DeviceSchema)),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(z.array(DeviceSchema))),
    exposed: "bridge"
  },
  addDevice: {
    meta: { openapi: { method: "POST" as const, path: "/device" } },
    args: z.object({ device: DeviceSchema }).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema)),
    exposed: "bridge"
  },
  removeDevice: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/device/{deviceId}"
      }
    },
    args: z.object({ deviceId: z.string() }).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema)),
    exposed: "bridge"
  }
};

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
    }, BridgeOnlyAPIRoutes as BridgeAPIRoutesType);

/* API Utility Types */

export type BridgeAPIMethod<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["meta"]["openapi"]["method"];
export type BridgeAPIArgs<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["args"]["shape"];
export type BridgeAPIReturns<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["returns"];
export type BridgeAPIExposure<Key extends keyof BridgeAPIRoutesType> =
  BridgeAPIRoutesType[Key]["exposed"];
