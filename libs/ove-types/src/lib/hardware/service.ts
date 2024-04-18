import { z } from "zod";
import {
  BrowserSchema,
  IDSchema,
  ImageSchema,
  ScreenshotMethodSchema,
  SourceSchemas, StatusOptionsSchema,
  StatusSchema
} from "../hardware";
import { ResponseSchema } from "../ove-types";

/* Utility Types */

/**
 * For converting tRPC calls to REST
 */
export type RouteMethod = "GET" | "POST" | "DELETE";

/**
 * Where functionality is exposed, allowing for hardware calls available on
 * bridge, i.e. mute/unmute that aren't available on ove-client
 */
export type ExposureLevel = "client" | "bridge";

/* API Route Types */

/**
 * Schema for each route as a type for mapping.
 */
export type TServiceRouteSchema<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> = {
  meta: { openapi: { method: M, path: `/${string}`, protected: boolean } }
  args: z.ZodObject<A, "strict", z.ZodTypeAny>
  returns: U
  exposed: E
};

/* API */

/**
 * Instantiation of the schema type above.
 */
export const ServiceAPISchema = {
  getStatus: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/status",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusOptionsSchema,
    exposed: "client" as const
  },
  getInfo: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/info",
        protected: true
      }
    },
    args: z.strictObject({ type: z.string().optional() }),
    returns: z.unknown(),
    exposed: "client" as const
  },
  getBrowser: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/browser/{browserId}",
        protected: true
      }
    },
    args: z.strictObject({ browserId: z.number() }),
    returns: BrowserSchema,
    exposed: "client" as const
  },
  getBrowsers: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/browsers",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: z.map(z.number(), BrowserSchema),
    exposed: "client" as const
  },
  reboot: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/reboot",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "client" as const
  },
  shutdown: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/shutdown",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "client" as const
  },
  execute: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/execute",
        protected: true
      }
    },
    args: z.strictObject({ command: z.string() }),
    returns: ResponseSchema,
    exposed: "client" as const
  },
  screenshot: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/screenshot",
        protected: true
      }
    },
    args: z.strictObject({
      method: ScreenshotMethodSchema,
      screens: z.array(IDSchema)
    }),
    returns: z.array(ImageSchema),
    exposed: "client" as const
  },
  openBrowser: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/browser",
        protected: true
      }
    },
    args: z.strictObject({
      url: z.string().optional(),
      displayId: IDSchema.optional()
    }),
    returns: IDSchema,
    exposed: "client" as const
  },
  closeBrowser: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/browser/{browserId}",
        protected: true
      }
    },
    args: z.strictObject({ browserId: IDSchema }),
    returns: z.boolean(),
    exposed: "client" as const
  },
  closeBrowsers: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/browsers",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: z.boolean(),
    exposed: "client" as const
  },
  start: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/start",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "bridge" as const
  },
  setVolume: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/volume",
        protected: true
      }
    },
    args: z.strictObject({ volume: z.number() }),
    returns: StatusSchema,
    exposed: "bridge" as const
  },
  setSource: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/source",
        protected: true
      }
    },
    args: z.strictObject({
      source: SourceSchemas,
      channel: z.number().optional()
    }),
    returns: StatusSchema,
    exposed: "bridge" as const
  },
  mute: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/mute",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "bridge" as const
  },
  unmute: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/unmute",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "bridge" as const
  },
  muteAudio: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/audio/mute",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "bridge" as const
  },
  unmuteAudio: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/audio/unmute",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "bridge" as const
  },
  muteVideo: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/video/mute",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "bridge" as const
  },
  unmuteVideo: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/video/unmute",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "bridge" as const
  },
  setWindowConfig: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/env/windowConfig",
        protected: true
      }
    },
    args: z.strictObject({ config: z.record(z.string(), z.string()) }),
    returns: StatusSchema,
    exposed: "client" as const
  },
  getWindowConfig: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/env/windowConfig",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: z.record(z.string(), z.string()),
    exposed: "client" as const
  },
  reloadBrowser: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/browser/{browserId}/reload",
        protected: true
      }
    },
    args: z.strictObject({ browserId: IDSchema }),
    returns: StatusSchema,
    exposed: "client" as const
  },
  reloadBrowsers: {
    meta: {
      openapi: {
        method: "POST" as const,
        path: "/browsers/reload",
        protected: true
      }
    },
    args: z.strictObject({}),
    returns: StatusSchema,
    exposed: "client" as const
  }
};

export type TServiceRoutesSchema = typeof ServiceAPISchema;

/* API Utility Types */

/**
 * Get RouteMethod for a route
 */
export type OpenAPIMethod<Key extends keyof TServiceRoutesSchema> =
  TServiceRoutesSchema[Key]["meta"]["openapi"]["method"];
/**
 * Get ExposureLevel for a route
 */
export type APIExposureLevel<Key extends keyof TServiceRoutesSchema> =
  TServiceRoutesSchema[Key]["exposed"];

/**
 * Input schema for a route
 */
export type ServiceRouteInputSchema<Key extends keyof TServiceRoutesSchema> =
  TServiceRoutesSchema[Key]["args"]["shape"];
/**
 * Output schema for a route
 */
export type ServiceRouteOutputSchema<Key extends keyof TServiceRoutesSchema> =
  TServiceRoutesSchema[Key]["returns"];

