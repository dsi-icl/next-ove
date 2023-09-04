import { z } from "zod";
import {
  IDSchema,
  ImageSchema,
  ScreenshotMethodSchema,
  SourceSchemas,
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

/* API Type */

/**
 * All possible routes as schema types.
 */
export type TServiceRoutesSchema = {
  getStatus: TServiceRouteSchema<{}, z.ZodBoolean, "GET", "client">
  getInfo: TServiceRouteSchema<{
    type: z.ZodOptional<z.ZodString>
  }, z.ZodUnknown, "GET", "client">
  getBrowserStatus: TServiceRouteSchema<{
    browserId: z.ZodNumber
  }, z.ZodBoolean, "GET", "client">
  getBrowsers: TServiceRouteSchema<
    {},
    z.ZodArray<z.ZodNumber>, "GET", "client">
  reboot: TServiceRouteSchema<{}, z.ZodBoolean, "POST", "client">
  shutdown: TServiceRouteSchema<{}, z.ZodBoolean, "POST", "client">
  execute: TServiceRouteSchema<{
    command: z.ZodString
  }, typeof ResponseSchema, "POST", "client">
  screenshot: TServiceRouteSchema<{
    method: typeof ScreenshotMethodSchema,
    screens: z.ZodArray<z.ZodNumber>
  }, z.ZodArray<typeof ImageSchema>, "POST", "client">
  openBrowser: TServiceRouteSchema<{
    url: z.ZodOptional<z.ZodString>,
    displayId: z.ZodOptional<z.ZodNumber>
  }, z.ZodNumber, "POST", "client">
  closeBrowser: TServiceRouteSchema<{
    browserId: z.ZodNumber
  }, z.ZodBoolean, "DELETE", "client">
  closeBrowsers: TServiceRouteSchema<{}, z.ZodBoolean, "DELETE", "client">
  start: TServiceRouteSchema<{}, z.ZodBoolean, "POST", "bridge">
  setVolume: TServiceRouteSchema<{ volume: z.ZodNumber }, z.ZodBoolean, "POST", "bridge">
  setSource: TServiceRouteSchema<{
    source: typeof SourceSchemas,
    channel: z.ZodOptional<z.ZodNumber>
  }, z.ZodBoolean, "POST", "bridge">
  mute: TServiceRouteSchema<{}, z.ZodBoolean, "POST", "bridge">
  unmute: TServiceRouteSchema<{}, z.ZodBoolean, "POST", "bridge">
  muteAudio: TServiceRouteSchema<{}, z.ZodBoolean, "POST", "bridge">
  unmuteAudio: TServiceRouteSchema<{}, z.ZodBoolean, "POST", "bridge">
  muteVideo: TServiceRouteSchema<{}, z.ZodBoolean, "POST", "bridge">
  unmuteVideo: TServiceRouteSchema<{}, z.ZodBoolean, "POST", "bridge">
}

/* API */

/**
 * Instantiation of the schema type above.
 */
export const ServiceAPISchema: TServiceRoutesSchema = {
  getStatus: {
    meta: { openapi: { method: "GET" as const, path: "/status", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "client" as const
  },
  getInfo: {
    meta: { openapi: { method: "GET" as const, path: "/info", protected: true } },
    args: z.object({ type: z.string().optional() }).strict(),
    returns: z.unknown(),
    exposed: "client"
  },
  getBrowserStatus: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/browser/{browserId}/status",
        protected: true
      }
    },
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema,
    exposed: "client"
  },
  getBrowsers: {
    meta: { openapi: { method: "GET" as const, path: "/browsers", protected: true } },
    args: z.object({}).strict(),
    returns: z.array(IDSchema),
    exposed: "client"
  },
  reboot: {
    meta: { openapi: { method: "POST" as const, path: "/reboot", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "client"
  },
  shutdown: {
    meta: { openapi: { method: "POST" as const, path: "/shutdown", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "client"
  },
  execute: {
    meta: { openapi: { method: "POST" as const, path: "/execute", protected: true } },
    args: z.object({ command: z.string() }).strict(),
    returns: ResponseSchema,
    exposed: "client"
  },
  screenshot: {
    meta: { openapi: { method: "POST" as const, path: "/screenshot", protected: true } },
    args: z.object({
      method: ScreenshotMethodSchema,
      screens: z.array(IDSchema)
    }).strict(),
    returns: z.array(ImageSchema),
    exposed: "client"
  },
  openBrowser: {
    meta: { openapi: { method: "POST" as const, path: "/browser", protected: true } },
    args: z.object({
      url: z.string().optional(),
      displayId: IDSchema.optional()
    }).strict(),
    returns: IDSchema,
    exposed: "client"
  },
  closeBrowser: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/browser/{browserId}",
        protected: true
      }
    },
    args: z.object({ browserId: IDSchema }).strict(),
    returns: z.boolean(),
    exposed: "client"
  },
  closeBrowsers: {
    meta: { openapi: { method: "DELETE" as const, path: "/browsers", protected: true } },
    args: z.object({}).strict(),
    returns: z.boolean(),
    exposed: "client"
  },
  start: {
    meta: { openapi: { method: "POST" as const, path: "/start", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  setVolume: {
    meta: { openapi: { method: "POST" as const, path: "/volume", protected: true } },
    args: z.object({ volume: z.number() }).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  setSource: {
    meta: { openapi: { method: "POST" as const, path: "/source", protected: true } },
    args: z.object({
      source: SourceSchemas,
      channel: z.number().optional()
    }).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  mute: {
    meta: { openapi: { method: "POST" as const, path: "/mute", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  unmute: {
    meta: { openapi: { method: "POST" as const, path: "/unmute", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  muteAudio: {
    meta: { openapi: { method: "POST" as const, path: "/audio/mute", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  unmuteAudio: {
    meta: { openapi: { method: "POST" as const, path: "/audio/unmute", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  muteVideo: {
    meta: { openapi: { method: "POST" as const, path: "/video/mute", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  unmuteVideo: {
    meta: { openapi: { method: "POST" as const, path: "/video/unmute", protected: true } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  }
};

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

