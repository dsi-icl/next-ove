import { z } from "zod";
import {
  StatusSchema,
  DeviceSchema, BoundsSchema
} from "../hardware";
import {
  AutoScheduleSchema,
  CalendarEventSchema,
  CalendarSchema,
  PowerModeSchema
} from "../ove-types";
import {
  getBridgeResponseSchema,
  type TBridgeResponse
} from "../hardware/bridge-transform";
import {
  getDeviceResponseSchema,
  type TDeviceResponse
} from "../hardware/client-transform";

/* Utility Types */

export type InboundAPI = {
  [Key in keyof TAPIRoutes]: (
    args: Omit<z.infer<TAPIRoutes[Key]["input"]>, "bridgeId">
  ) => Promise<Awaited<z.infer<TAPIRoutes[Key]["output"]>["response"]>>
}

export type APIController = Omit<TAPIRoutes, "getPublicKey">

export const excludeKeys: readonly (keyof TAPIRoutes)[] = ["getPublicKey"];

export type TBridgeService = {
  [Key in keyof TAPIRoutes]: (
    args: Omit<z.infer<TAPIRoutes[Key]["input"]>, "bridgeId">
  ) => z.infer<TAPIRoutes[Key]["output"]>["response"]
}

export type TParameters<Key extends keyof TBridgeService> =
  Parameters<TBridgeService[Key]>[0]
export type TCallback<Key extends keyof TBridgeService> = (
  response: TBridgeResponse<TDeviceResponse<ReturnType<TBridgeService[Key]>>>
) => void

export type TBridgeController = {
  [Key in keyof APIController]: (args: TParameters<Key>) =>
    Promise<TBridgeResponse<TDeviceResponse<ReturnType<TBridgeService[Key]>>>>
}

export type TSocketOutEvents = {
  [Key in keyof APIController]: (
    args: TParameters<Key>,
    callback: TCallback<Key>
  ) => void
}

export type TSocketInEvents = Record<string, never>
type TGet = "GET"
export type TIsGet<Key extends keyof TBridgeService, T, U> =
  TAPIRoutes[Key]["meta"]["openapi"]["method"] extends TGet ? T : U

const EnvSchema = z.strictObject({
  bridgeName: z.string().optional(),
  coreURL: z.string().optional(),
  calendarURL: z.string().optional()
});

export const APIRoutes = {
  getDevice: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/device/{bridgeId}/{deviceId}" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ deviceId: z.string(), bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(DeviceSchema))
  },
  getDevices: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/devices/{bridgeId}" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ tag: z.string().optional(), bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(z.array(DeviceSchema)))
  },
  addDevice: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/device/{bridgeId}" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ device: DeviceSchema, bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  },
  removeDevice: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/device/{bridgeId}/{deviceId}" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ deviceId: z.string(), bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  },
  startStreams: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/streams/{bridgeId}" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  },
  stopStreams: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/streams/{bridgeId}" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  },
  getStreams: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/streams/{bridgeId}" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(z.array(z.string()).optional()))
  },
  getCalendar: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/calendar" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(CalendarSchema.optional()))
  },
  getSocketStatus: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/socket/status" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.boolean()))
  },
  getMode: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/mode" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(PowerModeSchema))
  },
  setManualSchedule: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/mode/manual" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.void()))
  },
  setEcoSchedule: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/mode/eco" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({
      bridgeId: z.string(),
      ecoSchedule: z.array(CalendarEventSchema)
    }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.void()))
  },
  setAutoSchedule: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/mode/auto" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({
      bridgeId: z.string(),
      autoSchedule: AutoScheduleSchema.optional()
    }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.void()))
  },
  getEnv: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/env" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(EnvSchema))
  },
  updateEnv: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/env" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }).merge(EnvSchema),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.void()))
  },
  registerAuth: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/auth" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({
      bridgeId: z.string(),
      id: z.string(),
      pin: z.string()
    }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.void().promise()))
  },
  getDevicesToAuth: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/devices/auth" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(z.array(DeviceSchema)))
  },
  getAppVersion: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/version" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.string()))
  },
  getPublicKey: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/key" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.string()))
  },
  getAutoSchedule: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/autoSchedule" as `/${string}`,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(AutoScheduleSchema.optional()))
  },
  getGeometry: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/geometry" as const,
        protect: true
      }
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(BoundsSchema.optional()))
  }
};

export type TAPIRoutes = typeof APIRoutes
