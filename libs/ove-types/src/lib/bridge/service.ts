import { z } from "zod";
import { BoundsSchema, DeviceSchema, StatusSchema } from "../hardware";
import {
  AutoScheduleSchema,
  CalendarSchema,
  PowerModeSchema,
  type Traceable,
} from "../ove-types";

/* Utility Types */

export type InboundAPI = {
  [Key in keyof TAPIRoutes]: (
    args: Omit<z.infer<TAPIRoutes[Key]["input"]>, "bridgeId">,
  ) => Promise<Awaited<z.infer<TAPIRoutes[Key]["output"]>>>;
};

export type APIController = Omit<TAPIRoutes, "getPublicKey">;

export type TBridgeService = {
  [Key in keyof TAPIRoutes]: (
    args: Omit<z.infer<TAPIRoutes[Key]["input"]>, "bridgeId">,
  ) => Promise<z.infer<TAPIRoutes[Key]["output"]>>;
};

export type TBridgeServiceReturn<Key extends keyof TAPIRoutes> = z.infer<
  TAPIRoutes[Key]["output"]
>;

export type TParameters<Key extends keyof TBridgeService> = Traceable<Parameters<
  TBridgeService[Key]
>[0]>;
export type TCallback<Key extends keyof TBridgeService> = (
  response:
    | Traceable<{ status: "success"; data: TBridgeServiceReturn<Key> }>
    | Traceable<{ status: "error"; error: string }>,
) => void;

export type TBridgeController = {
  [Key in keyof APIController]: (
    args: TParameters<Key>,
  ) => Promise<TBridgeServiceReturn<Key>>;
};

export type TSocketOutEvents = {
  [Key in keyof APIController]: (
    args: Traceable<TParameters<Key>>,
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
    output: DeviceSchema,
  },
  getDevices: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/bridges/{bridgeId}/devices" as `/${string}`,
        protect: true,
      },
    },
    input: z.strictObject({
      tags: z.string().array().optional(),
      bridgeId: z.string(),
    }),
    output: z.array(DeviceSchema),
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
    output: StatusSchema,
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
    output: StatusSchema,
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
    output: StatusSchema,
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
    output: StatusSchema,
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
    output: z.string().array().optional(),
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
    output: StatusSchema,
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
    output: CalendarSchema.optional(),
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
    output: z.boolean(),
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
    output: PowerModeSchema,
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
    output: StatusSchema,
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
    output: z.undefined(),
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
    output: z.string(),
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
    output: AutoScheduleSchema.optional(),
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
    output: BoundsSchema.optional(),
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
    output: z.boolean(),
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
    output: z.boolean(),
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
    output: z.boolean(),
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
    output: z.boolean(),
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
    output: z.strictObject({
      nextStart: z.string().nullable(),
      nextStop: z.string().nullable(),
    }),
  },
};

export type TAPIRoutes = typeof APIRoutes;
