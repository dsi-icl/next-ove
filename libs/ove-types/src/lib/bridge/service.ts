import { z } from "zod";
import {
  StatusSchema,
  DeviceSchema,
  type Device
} from "../hardware";
import { type OVEException, type RouteMethod } from "../ove-types";

/* Utility Types */

export type TBridgeServiceParams = {
  getDevice: {
    args: { deviceId: string }
    returns: Device | undefined
  }
  getDevices: {
    args: { tag?: string }
    returns: Device[]
  }
  addDevice: {
    args: { device: Device }
    returns: boolean
  }
  removeDevice: {
    args: { deviceId: string }
    returns: boolean
  }
  loadVideoStream: {
    args: { streamURL: string }
    returns: boolean
  }
}

export type TBridgeService = {
  [Key in keyof TBridgeServiceParams]: (args: TBridgeServiceParams[Key]["args"], listeners?: ((args: TBridgeServiceParams[Key]["args"]) => void)[]) => TBridgeServiceParams[Key]["returns"]
}

type TWrappedResponseRaw<Key extends keyof TBridgeService> =
  ReturnType<TBridgeService[Key]>
  | OVEException
export type TWrappedResponse<Key extends keyof TBridgeService> = {
  meta: { bridge: string },
  response: TWrappedResponseRaw<Key>
}

export type TParameters<Key extends keyof TBridgeService> = Parameters<TBridgeService[Key]>[0]
export type TCallback<Key extends keyof TBridgeService> = (response: TWrappedResponse<Key>) => void
export type TEventListener<Key extends keyof TBridgeService> = Parameters<TBridgeService[Key]>[1]

export type TBridgeController = {
  [Key in keyof TBridgeService]: (args: TParameters<Key>, listeners: TEventListener<Key>) => TWrappedResponse<Key>
}

export type TSocketOutEvents = {
  [Key in keyof TBridgeService]: (args: TParameters<Key>, callback: TCallback<Key>) => void
}

export type TEventListeners = {
  [Key in keyof TBridgeService]: NonNullable<TEventListener<Key>>
}

const wrapSchema = <T extends z.ZodTypeAny>(schema: T) => z.strictObject({
  meta: z.strictObject({ bridge: z.string() }),
  response: schema
});

export type TSocketInEvents = {}
type OpenApiMeta<A extends RouteMethod> = {
  openapi: { method: A, path: `/${string}`, protect: boolean }
}
type TGet = "GET"
export type TIsGet<Key extends keyof TBridgeService, T, U> = TAPIRoutes[Key]["meta"]["openapi"]["method"] extends TGet ? T : U

export const APIRoutes = {
  getDevice: {
    meta: {
      openapi: {
        method: "GET",
        path: "/device/{deviceId}",
        protect: true
      }
    } as OpenApiMeta<"GET">,
    input: z.strictObject({ deviceId: z.string(), bridgeId: z.string() }),
    output: wrapSchema(DeviceSchema)
  },
  getDevices: {
    meta: {
      openapi: {
        method: "GET",
        path: "/devices",
        protect: true
      }
    } as OpenApiMeta<"GET">,
    input: z.strictObject({ tag: z.string().optional(), bridgeId: z.string() }),
    output: wrapSchema(z.array(DeviceSchema))
  },
  addDevice: {
    meta: {
      openapi: {
        method: "POST",
        path: "/device",
        protect: true
      }
    } as OpenApiMeta<"POST">,
    input: z.strictObject({ device: DeviceSchema, bridgeId: z.string() }),
    output: wrapSchema(StatusSchema)
  },
  removeDevice: {
    meta: {
      openapi: {
        method: "DELETE",
        path: "/device/{deviceId}",
        protect: true
      }
    } as OpenApiMeta<"DELETE">,
    input: z.strictObject({ deviceId: z.string(), bridgeId: z.string() }),
    output: wrapSchema(StatusSchema)
  },
  loadVideoStream: {
    meta: {
      openapi: {
        method: "POST",
        path: "/stream",
        protect: true
      }
    } as OpenApiMeta<"POST">,
    input: z.strictObject({ streamURL: z.string(), bridgeId: z.string() }),
    output: wrapSchema(StatusSchema)
  }
};

export type TAPIRoutes = typeof APIRoutes
