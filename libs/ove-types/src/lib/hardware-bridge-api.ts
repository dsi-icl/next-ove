import { z } from "zod";
import {
  ClientAPIArgs, ClientAPIReturns,
  ClientAPIRoute, ClientAPIRoutes,
  ClientAPIRoutesType, DeviceResponse, getDeviceResponseSchema
} from "./hardware-client-api";
import {
  Device,
  DeviceIDSchema,
  DeviceSchema, Optional,
  OVEExceptionSchema,
  StatusSchema
} from "@ove/ove-types";

/* Utility Schemas */

export const BridgeMetadataSchema = z.object({ bridge: z.string() });
export const getMultiDeviceResponseSchema = <T extends z.ZodTypeAny>(schema: T): MultiDeviceResponse<T> => z.union([z.array(z.object({
  deviceId: z.string(),
  response: getDeviceResponseSchema(schema)
})), OVEExceptionSchema]);

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

export type BridgeAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  bridge: BridgeResponse<ClientAPIRoute<A, U>["client"]>
} & { [Key in keyof ClientAPIRoute<A, U>]: ClientAPIRoute<A, U>[Key] };

export type BridgeAPIRouteAll<A extends z.ZodRawShape, U extends z.ZodTypeAny> =
  {
    bridge: BridgeResponse<MultiDeviceResponse<ClientAPIRoute<A, U>["returns"]>>
  }
  & { [Key in keyof ClientAPIRoute<A, U>]: ClientAPIRoute<A, U>[Key] };

export type BridgeBaseDeviceAPIRoutesType = {
  start: BridgeAPIRoute<
    {},
    z.ZodBoolean
  >
};

export type BridgeDeviceAPIRoutesType =
  {
    [Key in keyof BridgeBaseDeviceAPIRoutesType]: BridgeAPIRoute<z.extendShape<BridgeBaseDeviceAPIRoutesType[Key]["args"]["shape"], {
    deviceId: z.ZodString
  }>, BridgeBaseDeviceAPIRoutesType[Key]["returns"]>
  }
  & {
  [Key in keyof BridgeBaseDeviceAPIRoutesType as `${Key}All`]: BridgeAPIRouteAll<z.extendShape<BridgeBaseDeviceAPIRoutesType[Key]["args"]["shape"], {
    tag: z.ZodOptional<z.ZodString>
  }>, BridgeBaseDeviceAPIRoutesType[Key]["returns"]>
}


export type BridgeServiceAPIRoutesType = {
  getDevice: BridgeAPIRoute<
    { deviceId: z.ZodString },
    typeof DeviceSchema
  >
  getDevices: BridgeAPIRoute<
    { tag: z.ZodOptional<z.ZodString> },
    z.ZodArray<typeof DeviceSchema>
  >
  addDevice: BridgeAPIRoute<
    { device: typeof DeviceSchema },
    z.ZodBoolean
  >
  removeDevice: BridgeAPIRoute<
    { deviceId: z.ZodString },
    z.ZodBoolean
  >
};

export type BridgeAPIRoutesType = BridgeServiceAPIRoutesType
  & BridgeDeviceAPIRoutesType
  & {
  [Key in keyof ClientAPIRoutesType]: BridgeAPIRoute<z.extendShape<ClientAPIArgs<Key>, {
    deviceId: z.ZodString
  }>, ClientAPIReturns<Key>>
}
  & {
  [Key in keyof ClientAPIRoutesType as `${Key}All`]: BridgeAPIRouteAll<z.extendShape<
    ClientAPIArgs<Key>,
    { tag: z.ZodOptional<z.ZodString> }
  >, ClientAPIReturns<Key>>
};

/* API Schemas */

export const getBridgeResponseSchema = <T extends z.ZodTypeAny>(schema: T): BridgeResponse<T> => {
  return z.object({
    meta: BridgeMetadataSchema,
    bridgeResponse: schema
  });
};

/* API */

export const BridgeServiceAPIRoutes: BridgeServiceAPIRoutesType = {
  getDevice: {
    meta: { openapi: { method: "GET", path: "/device/{deviceId}" } },
    args: z.object({ deviceId: z.string() }).strict(),
    returns: DeviceSchema,
    client: getDeviceResponseSchema(DeviceSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(DeviceSchema))
  },
  getDevices: {
    meta: { openapi: { method: "GET", path: "/devices" } },
    args: z.object({ tag: z.string().optional() }).strict(),
    returns: z.array(DeviceSchema),
    client: getDeviceResponseSchema(z.array(DeviceSchema)),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(z.array(DeviceSchema)))
  },
  addDevice: {
    meta: { openapi: { method: "POST", path: "/device" } },
    args: z.object({ device: DeviceSchema }).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  },
  removeDevice: {
    meta: { openapi: { method: "DELETE", path: "/device/{deviceId}" } },
    args: z.object({ deviceId: z.string() }).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  }
};

const BridgeDeviceAPIRoutes: BridgeDeviceAPIRoutesType = {
  start: {
    meta: { openapi: { method: "POST", path: "/{deviceId}/start" } },
    args: z.object({ deviceId: z.string() }).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  },
  startAll: {
    meta: { openapi: { method: "POST", path: "/start" } },
    args: z.object({ tag: z.string().optional() }).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getMultiDeviceResponseSchema(StatusSchema))
  }
};

export const BridgeAPIRoutes: BridgeAPIRoutesType = (Object.keys(ClientAPIRoutes) as Array<keyof ClientAPIRoutesType>).reduce((acc, k) => {
  return {
    ...acc,
    [k]: {
      returns: ClientAPIRoutes[k].returns,
      args: ClientAPIRoutes[k].args.extend({
        deviceId: DeviceIDSchema
      }),
      client: ClientAPIRoutes[k].client,
      bridge: getBridgeResponseSchema(ClientAPIRoutes[k].client)
    },
    [`${k}All`]: {
      returns: ClientAPIRoutes[k].returns,
      args: ClientAPIRoutes[k].args.extend({
        tag: z.string().optional()
      }),
      client: ClientAPIRoutes[k].client,
      bridge: getBridgeResponseSchema(getMultiDeviceResponseSchema(ClientAPIRoutes[k].client))
    }
  };
}, { ...BridgeServiceAPIRoutes, ...BridgeDeviceAPIRoutes } as BridgeAPIRoutesType);

/* API Type */

export type DeviceService = {
  [Key in keyof ClientAPIRoutesType]?: (
    device: Device,
    args: z.infer<ClientAPIRoutesType[Key]["args"]>
  ) => Promise<Optional<z.infer<ClientAPIRoutesType[Key]["client"]>>>
} & {
  [Key in keyof BridgeBaseDeviceAPIRoutesType]?: (
    device: Device,
    args: z.infer<BridgeBaseDeviceAPIRoutesType[Key]["args"]>
  ) => Promise<Optional<z.infer<BridgeBaseDeviceAPIRoutesType[Key]["client"]>>>
};

export type BridgeService = {
  [Key in keyof BridgeServiceAPIRoutesType]: (
    args: z.infer<BridgeServiceAPIRoutesType[Key]["args"]>,
    callback: (response: z.infer<BridgeServiceAPIRoutesType[Key]["bridge"]>) => void
  ) => void
};

export type HardwareServerToClientEvents = {
  [Key in keyof BridgeAPIRoutesType]: (
    args: z.infer<BridgeAPIRoutesType[Key]["args"]>,
    callback: (response: z.infer<BridgeAPIRoutesType[Key]["bridge"]>) => void
  ) => void
};

export type HardwareClientToServerEvents = Record<string, unknown>;

/* API Utility Types */

export type BridgeServiceArgs<Key extends keyof BridgeServiceAPIRoutesType> = z.infer<BridgeServiceAPIRoutesType[Key]["args"]>
export type DeviceServiceArgs<Key extends keyof DeviceService> = z.infer<BridgeAPIRoutesType[Key]["args"]>;
