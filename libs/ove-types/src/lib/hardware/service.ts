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

export type RouteMethod = "GET" | "POST" | "DELETE";
export type ExposureLevel = "client" | "bridge" | "core";

/* API Route Types */

export type ServiceAPIRoute<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod,
  E extends ExposureLevel
> = {
  meta: { openapi: { method: M, path: `/${string}` } }
  args: z.ZodObject<A, "strict", z.ZodTypeAny>
  returns: U
  exposed: E
};

/* API Type */

export type ServiceAPIRoutesType = {
  getStatus: ServiceAPIRoute<{}, z.ZodBoolean, "GET", "client">
  getInfo: ServiceAPIRoute<{
    type: z.ZodOptional<z.ZodString>
  }, z.ZodUnknown, "GET", "client">
  getBrowserStatus: ServiceAPIRoute<{
    browserId: z.ZodNumber
  }, z.ZodBoolean, "GET", "client">
  getBrowsers: ServiceAPIRoute<
    {},
    z.ZodArray<z.ZodNumber>, "GET", "client">
  reboot: ServiceAPIRoute<{}, z.ZodBoolean, "POST", "client">
  shutdown: ServiceAPIRoute<{}, z.ZodBoolean, "POST", "client">
  execute: ServiceAPIRoute<{
    command: z.ZodString
  }, typeof ResponseSchema, "POST", "client">
  screenshot: ServiceAPIRoute<{
    method: typeof ScreenshotMethodSchema,
    screens: z.ZodArray<z.ZodNumber>
  }, z.ZodArray<typeof ImageSchema>, "POST", "client">
  openBrowser: ServiceAPIRoute<{
    url: z.ZodOptional<z.ZodString>,
    displayId: z.ZodOptional<z.ZodNumber>
  }, z.ZodNumber, "POST", "client">
  closeBrowser: ServiceAPIRoute<{
    browserId: z.ZodNumber
  }, z.ZodBoolean, "DELETE", "client">
  closeBrowsers: ServiceAPIRoute<{}, z.ZodBoolean, "DELETE", "client">
  start: ServiceAPIRoute<{}, z.ZodBoolean, "POST", "bridge">
  setVolume: ServiceAPIRoute<{ volume: z.ZodNumber }, z.ZodBoolean, "POST", "bridge">
  setSource: ServiceAPIRoute<{
    source: typeof SourceSchemas,
    channel: z.ZodOptional<z.ZodNumber>
  }, z.ZodBoolean, "POST", "bridge">
  mute: ServiceAPIRoute<{}, z.ZodBoolean, "POST", "bridge">
  unmute: ServiceAPIRoute<{}, z.ZodBoolean, "POST", "bridge">
  muteAudio: ServiceAPIRoute<{}, z.ZodBoolean, "POST", "bridge">
  unmuteAudio: ServiceAPIRoute<{}, z.ZodBoolean, "POST", "bridge">
  muteVideo: ServiceAPIRoute<{}, z.ZodBoolean, "POST", "bridge">
  unmuteVideo: ServiceAPIRoute<{}, z.ZodBoolean, "POST", "bridge">
}

/* API */

export const ServiceAPI: ServiceAPIRoutesType = {
  getStatus: {
    meta: { openapi: { method: "GET" as const, path: "/status" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "client" as const
  },
  getInfo: {
    meta: { openapi: { method: "GET" as const, path: "/info" } },
    args: z.object({ type: z.string().optional() }).strict(),
    returns: z.unknown(),
    exposed: "client"
  },
  getBrowserStatus: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/browser/{browserId}/status"
      }
    },
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema,
    exposed: "client"
  },
  getBrowsers: {
    meta: { openapi: { method: "GET" as const, path: "/browsers" } },
    args: z.object({}).strict(),
    returns: z.array(IDSchema),
    exposed: "client"
  },
  reboot: {
    meta: { openapi: { method: "POST" as const, path: "/reboot" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "client"
  },
  shutdown: {
    meta: { openapi: { method: "POST" as const, path: "/shutdown" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "client"
  },
  execute: {
    meta: { openapi: { method: "POST" as const, path: "/execute" } },
    args: z.object({ command: z.string() }).strict(),
    returns: ResponseSchema,
    exposed: "client"
  },
  screenshot: {
    meta: { openapi: { method: "POST" as const, path: "/screenshot" } },
    args: z.object({
      method: ScreenshotMethodSchema,
      screens: z.array(IDSchema)
    }).strict(),
    returns: z.array(ImageSchema),
    exposed: "client"
  },
  openBrowser: {
    meta: { openapi: { method: "POST" as const, path: "/browser" } },
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
        path: "/browser/{browserId}"
      }
    },
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema,
    exposed: "client"
  },
  closeBrowsers: {
    meta: { openapi: { method: "DELETE" as const, path: "/browsers" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "client"
  },
  start: {
    meta: { openapi: { method: "POST" as const, path: "/start" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  setVolume: {
    meta: { openapi: { method: "POST" as const, path: "/volume" } },
    args: z.object({ volume: z.number() }).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  setSource: {
    meta: { openapi: { method: "POST" as const, path: "/source" } },
    args: z.object({
      source: SourceSchemas,
      channel: z.number().optional()
    }).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  mute: {
    meta: { openapi: { method: "POST" as const, path: "/mute" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  unmute: {
    meta: { openapi: { method: "POST" as const, path: "/unmute" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  muteAudio: {
    meta: { openapi: { method: "POST" as const, path: "/muteAudio" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  unmuteAudio: {
    meta: { openapi: { method: "POST" as const, path: "/unmuteAudio" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  muteVideo: {
    meta: { openapi: { method: "POST" as const, path: "/muteVideo" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  },
  unmuteVideo: {
    meta: { openapi: { method: "POST" as const, path: "/unmuteVideo" } },
    args: z.object({}).strict(),
    returns: StatusSchema,
    exposed: "bridge"
  }
};

/* API Utility Types */

export type ServiceAPIMethod<Key extends keyof ServiceAPIRoutesType> =
  ServiceAPIRoutesType[Key]["meta"]["openapi"]["method"];
export type ServiceAPIArgs<Key extends keyof ServiceAPIRoutesType> =
  ServiceAPIRoutesType[Key]["args"]["shape"];
export type ServiceAPIReturns<Key extends keyof ServiceAPIRoutesType> =
  ServiceAPIRoutesType[Key]["returns"];
export type ServiceAPIExposure<Key extends keyof ServiceAPIRoutesType> =
  ServiceAPIRoutesType[Key]["exposed"];
