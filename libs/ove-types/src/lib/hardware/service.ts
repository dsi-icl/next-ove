import { z } from "zod";
import {
  DeviceSchema,
  IDSchema,
  ImageSchema,
  ScreenshotMethodSchema,
  SourceSchemas,
  StatusSchema
} from "../hardware";
import { ResponseSchema } from "../ove-types";

/* Utility Types */

export type RouteMethod = "GET" | "POST" | "DELETE";

/* API Route Types */

export type ServiceAPIRoute<
  A extends z.ZodRawShape,
  U extends z.ZodTypeAny,
  M extends RouteMethod
> = {
  meta: { openapi: { method: M, path: `/${string}` } }
  args: z.ZodObject<A, "strict", z.ZodTypeAny>
  returns: U
};

/* API Type */

export type ServiceAPIRoutesType = {
  getStatus: ServiceAPIRoute<{}, z.ZodBoolean, "GET">
  getInfo: ServiceAPIRoute<{
    type: z.ZodOptional<z.ZodString>
  }, z.ZodUnknown, "GET">
  getBrowserStatus: ServiceAPIRoute<{
    browserId: z.ZodNumber
  }, z.ZodBoolean, "GET">
  getBrowsers: ServiceAPIRoute<
    {},
    z.ZodArray<z.ZodNumber>, "GET">
  reboot: ServiceAPIRoute<{}, z.ZodBoolean, "POST">
  shutdown: ServiceAPIRoute<{}, z.ZodBoolean, "POST">
  execute: ServiceAPIRoute<{
    command: z.ZodString
  }, typeof ResponseSchema, "POST">
  screenshot: ServiceAPIRoute<{
    method: typeof ScreenshotMethodSchema,
    screens: z.ZodArray<z.ZodNumber>
  }, z.ZodArray<typeof ImageSchema>, "POST">
  openBrowser: ServiceAPIRoute<{
    url: z.ZodOptional<z.ZodString>,
    displayId: z.ZodOptional<z.ZodNumber>
  }, z.ZodNumber, "POST">
  closeBrowser: ServiceAPIRoute<{
    browserId: z.ZodNumber
  }, z.ZodBoolean, "DELETE">
  closeBrowsers: ServiceAPIRoute<{}, z.ZodBoolean, "DELETE">
  start: ServiceAPIRoute<{}, z.ZodBoolean, "POST">
  setVolume: ServiceAPIRoute<{ volume: z.ZodNumber }, z.ZodBoolean, "POST">
  setSource: ServiceAPIRoute<{
    source: typeof SourceSchemas,
    channel: z.ZodOptional<z.ZodNumber>
  }, z.ZodBoolean, "POST">
  mute: ServiceAPIRoute<{}, z.ZodBoolean, "POST">
  unmute: ServiceAPIRoute<{}, z.ZodBoolean, "POST">
  muteAudio: ServiceAPIRoute<{}, z.ZodBoolean, "POST">
  unmuteAudio: ServiceAPIRoute<{}, z.ZodBoolean, "POST">
  muteVideo: ServiceAPIRoute<{}, z.ZodBoolean, "POST">
  unmuteVideo: ServiceAPIRoute<{}, z.ZodBoolean, "POST">
  getDevice: ServiceAPIRoute<
    { deviceId: z.ZodString },
    typeof DeviceSchema,
    "GET"
  >
  getDevices: ServiceAPIRoute<
    { tag: z.ZodOptional<z.ZodString> },
    z.ZodArray<typeof DeviceSchema>,
    "GET"
  >
  addDevice: ServiceAPIRoute<
    { device: typeof DeviceSchema },
    z.ZodBoolean,
    "POST"
  >
  removeDevice: ServiceAPIRoute<
    { deviceId: z.ZodString },
    z.ZodBoolean,
    "DELETE"
  >
}

/* API */

export const ServiceAPI: ServiceAPIRoutesType = {
  getStatus: {
    meta: { openapi: { method: "GET" as const, path: "/status" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  getInfo: {
    meta: { openapi: { method: "GET" as const, path: "/info" } },
    args: z.object({ type: z.string().optional() }).strict(),
    returns: z.unknown()
  },
  getBrowserStatus: {
    meta: {
      openapi: {
        method: "GET" as const,
        path: "/browser/{browserId}/status"
      }
    },
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema
  },
  getBrowsers: {
    meta: { openapi: { method: "GET" as const, path: "/browsers" } },
    args: z.object({}).strict(),
    returns: z.array(IDSchema)
  },
  reboot: {
    meta: { openapi: { method: "POST" as const, path: "/reboot" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  shutdown: {
    meta: { openapi: { method: "POST" as const, path: "/shutdown" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  execute: {
    meta: { openapi: { method: "POST" as const, path: "/execute" } },
    args: z.object({ command: z.string() }).strict(),
    returns: ResponseSchema
  },
  screenshot: {
    meta: { openapi: { method: "POST" as const, path: "/screenshot" } },
    args: z.object({
      method: ScreenshotMethodSchema,
      screens: z.array(IDSchema)
    }).strict(),
    returns: z.array(ImageSchema)
  },
  openBrowser: {
    meta: { openapi: { method: "POST" as const, path: "/browser" } },
    args: z.object({
      url: z.string().optional(),
      displayId: IDSchema.optional()
    }).strict(),
    returns: IDSchema
  },
  closeBrowser: {
    meta: {
      openapi: {
        method: "DELETE" as const,
        path: "/browser/{browserId}"
      }
    },
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema
  },
  closeBrowsers: {
    meta: { openapi: { method: "DELETE" as const, path: "/browsers" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  start: {
    meta: { openapi: { method: "POST" as const, path: "/start" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  setVolume: {
    meta: { openapi: { method: "POST" as const, path: "/volume" } },
    args: z.object({ volume: z.number() }).strict(),
    returns: StatusSchema
  },
  setSource: {
    meta: { openapi: { method: "POST" as const, path: "/source" } },
    args: z.object({
      source: SourceSchemas,
      channel: z.number().optional()
    }).strict(),
    returns: StatusSchema
  },
  mute: {
    meta: { openapi: { method: "POST" as const, path: "/mute" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  unmute: {
    meta: { openapi: { method: "POST" as const, path: "/unmute" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  muteAudio: {
    meta: { openapi: { method: "POST" as const, path: "/muteAudio" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  unmuteAudio: {
    meta: { openapi: { method: "POST" as const, path: "/unmuteAudio" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  muteVideo: {
    meta: { openapi: { method: "POST" as const, path: "/muteVideo" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  unmuteVideo: {
    meta: { openapi: { method: "POST" as const, path: "/unmuteVideo" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  getDevice: {
    meta: { openapi: { method: "GET", path: "/device/{deviceId}" } },
    args: z.object({ deviceId: z.string() }).strict(),
    returns: DeviceSchema
  },
  getDevices: {
    meta: { openapi: { method: "GET", path: "/devices" } },
    args: z.object({ tag: z.string().optional() }).strict(),
    returns: z.array(DeviceSchema)
  },
  addDevice: {
    meta: { openapi: { method: "POST", path: "/device" } },
    args: z.object({ device: DeviceSchema }).strict(),
    returns: StatusSchema
  },
  removeDevice: {
    meta: { openapi: { method: "DELETE", path: "/device/{deviceId}" } },
    args: z.object({ deviceId: z.string() }).strict(),
    returns: StatusSchema
  }
};

/* API Utility Types */

export type ServiceAPIMethod<Key extends keyof ServiceAPIRoutesType> =
  ServiceAPIRoutesType[Key]["meta"]["openapi"]["method"];
export type ServiceAPIArgs<Key extends keyof ServiceAPIRoutesType> =
  ServiceAPIRoutesType[Key]["args"]["shape"];
export type ServiceAPIReturns<Key extends keyof ServiceAPIRoutesType> =
  ServiceAPIRoutesType[Key]["returns"];
