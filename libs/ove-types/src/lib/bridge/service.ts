import { z } from "zod";
import { StatusSchema, DeviceSchema, BoundsSchema } from "../hardware";
import {
  AutoScheduleSchema,
  CalendarSchema,
  PowerModeSchema,
} from "../ove-types";
import {
  getBridgeResponseSchema,
  type TBridgeResponse,
} from "../hardware/bridge-transform";
import {
  getDeviceResponseSchema,
  type TDeviceResponse,
} from "../hardware/client-transform";

/* Utility Types */

export type InboundAPI = {
  [Key in keyof TAPIRoutes]: (
    args: Omit<z.infer<TAPIRoutes[Key]["input"]>, "bridgeId">,
  ) => Promise<Awaited<z.infer<TAPIRoutes[Key]["output"]>["response"]>>;
};

export type APIController = Omit<TAPIRoutes, "getPublicKey">;

export type TBridgeService = {
  [Key in keyof TAPIRoutes]: (
    args: Omit<z.infer<TAPIRoutes[Key]["input"]>, "bridgeId">,
  ) => Promise<z.infer<TAPIRoutes[Key]["output"]>["response"]>;
};

export type TBridgeServiceReturn<Key extends keyof TAPIRoutes> = z.infer<
  TAPIRoutes[Key]["output"]
>["response"];

export type TParameters<Key extends keyof TBridgeService> = Parameters<
  TBridgeService[Key]
>[0];
export type TCallback<Key extends keyof TBridgeService> = (
  response: TBridgeResponse<TDeviceResponse<TBridgeServiceReturn<Key>>>,
) => void;

export type TBridgeController = {
  [Key in keyof APIController]: (
    args: TParameters<Key>,
  ) => Promise<TBridgeResponse<TDeviceResponse<TBridgeServiceReturn<Key>>>>;
};

export type TSocketOutEvents = {
  [Key in keyof APIController]: (
    args: TParameters<Key>,
    callback: TCallback<Key>,
  ) => void;
};

export type TSocketInEvents = Record<string, never>;
type TGet = "GET";
export type TIsGet<
  Key extends keyof TBridgeService,
  T,
  U,
> = TAPIRoutes[Key]["meta"]["openapi"]["method"] extends TGet ? T : U;

export const APIRoutes = {
  getDevice: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/device/{deviceId}" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ deviceId: z.string(), bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(DeviceSchema)),
  },
  getDevices: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/devices" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ tags: z.string().array().optional(), bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(z.array(DeviceSchema)),
    ),
  },
  addDevice: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/bridges/{bridgeId}/device" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ device: DeviceSchema, bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema)),
  },
  removeDevice: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/bridges/{bridgeId}/device/{deviceId}" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ deviceId: z.string(), bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema)),
  },
  startStreams: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/bridges/{bridgeId}/streams" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema)),
  },
  stopStreams: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/bridges/{bridgeId}/streams" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema)),
  },
  getStreams: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/streams" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(z.array(z.string()).optional()),
    ),
  },
  getStreamStatus: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/streams/status" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema)),
  },
  getCalendar: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/calendar" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(CalendarSchema.optional()),
    ),
  },
  getSocketStatus: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/socket/status" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.boolean())),
  },
  getMode: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/mode" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(PowerModeSchema)),
  },
  setMode: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/bridges/{bridgeId}/mode" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string(), mode: PowerModeSchema }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema)),
  },
  setAutoSchedule: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/bridges/{bridgeId}/mode/auto" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({
      bridgeId: z.string(),
      autoSchedule: AutoScheduleSchema,
    }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.undefined())),
  },
  getAppVersion: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/version" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.string())),
  },
  getAutoSchedule: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/autoSchedule" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(AutoScheduleSchema.optional()),
    ),
  },
  getGeometry: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/geometry" as const,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(
      getDeviceResponseSchema(BoundsSchema.optional()),
    ),
  },
  getReconciliation: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/reconciliation" as const,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.boolean())),
  },
  refreshReconciliation: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/bridges/{bridgeId}/reconciliation/refresh" as const,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.boolean())),
  },
  startReconciliation: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/bridges/{bridgeId}/reconciliation" as const,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.boolean())),
  },
  stopReconciliation: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/bridges/{bridgeId}/reconciliation" as const,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.boolean())),
  },
  getNextScheduled: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/nextScheduled" as const,
        protect: true,
      },
    },
    input: z.strictObject({ bridgeId: z.string() }),
    output: getBridgeResponseSchema(getDeviceResponseSchema(z.strictObject({
      nextStart: z.string().nullable(),
      nextStop: z.string().nullable(),
    }))),
  }
};

export type TAPIRoutes = typeof APIRoutes;
