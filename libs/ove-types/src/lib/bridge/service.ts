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
  startStreams: {
    args: {},
    returns: boolean
  },
  stopStreams: {
    args: {},
    returns: boolean
  },
  getStreams: {
    args: {},
    returns: string[] | undefined
  }
}

export type TBridgeService = {
  [Key in keyof TBridgeServiceParams]: (args: TBridgeServiceParams[Key]["args"]) => TBridgeServiceParams[Key]["returns"]
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

export type TBridgeController = {
  [Key in keyof TBridgeService]: (args: TParameters<Key>) => TWrappedResponse<Key>
}

export type TSocketOutEvents = {
  [Key in keyof TBridgeService]: (args: TParameters<Key>, callback: TCallback<Key>) => void
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
        path: "/device/{bridgeId}/{deviceId}",
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
        path: "/devices/{bridgeId}",
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
        path: "/device/{bridgeId}",
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
        path: "/device/{bridgeId}/{deviceId}",
        protect: true
      }
    } as OpenApiMeta<"DELETE">,
    input: z.strictObject({ deviceId: z.string(), bridgeId: z.string() }),
    output: wrapSchema(StatusSchema)
  },
  startStreams: {
    meta: {
      openapi: {
        method: "POST",
        path: "/streams/{bridgeId}",
        protect: true
      }
    } as OpenApiMeta<"POST">,
    input: z.strictObject({ bridgeId: z.string() }),
    output: wrapSchema(StatusSchema)
  },
  stopStreams: {
    meta: {
      openapi: {
        method: "DELETE",
        path: "/streams/{bridgeId}",
        protect: true
      }
    } as OpenApiMeta<"DELETE">,
    input: z.strictObject({ bridgeId: z.string() }),
    output: wrapSchema(StatusSchema)
  },
  getStreams: {
    meta: {
      openapi: {
        method: "GET",
        path: "/streams/{bridgeId}",
        protect: true
      }
    } as OpenApiMeta<"GET">,
    input: z.strictObject({ bridgeId: z.string() }),
    output: wrapSchema(z.array(z.string()).optional())
  }
};

export type TAPIRoutes = typeof APIRoutes
