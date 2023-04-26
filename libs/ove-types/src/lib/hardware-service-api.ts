import { z } from "zod";
import {
  IDSchema,
  ImageSchema,
  ResponseSchema,
  ScreenshotMethodSchema,
  SourceSchemas,
  StatusSchema
} from "@ove/ove-types";

/* API Route Types */

export type ServiceAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  meta: { openapi: { method: "GET" | "POST" | "DELETE", path: string } }
  args: z.ZodObject<A, "strict", z.ZodTypeAny>
  returns: U
};

/* API */

export const ServiceAPI = {
  getStatus: {
    meta: { openapi: { method: "GET", path: "/status" } },
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  getInfo: {
    meta: { openapi: { method: "GET", path: "/info" } },
    args: z.object({ type: z.string().optional() }).strict(),
    returns: z.unknown()
  },
  getBrowserStatus: {
    meta: { openapi: { method: "GET", path: "/browser/{browserId}/status" } },
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema
  },
  getBrowsers: {
    meta: { openapi: { method: "GET", path: "/browsers" } },
    args: z.object({}).strict(),
    returns: z.array(IDSchema)
  },
  reboot: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  shutdown: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  execute: {
    args: z.object({ command: z.string() }).strict(),
    returns: ResponseSchema
  },
  screenshot: {
    args: z.object({
      method: ScreenshotMethodSchema,
      screens: z.array(IDSchema)
    }).strict(),
    returns: z.array(ImageSchema)
  },
  openBrowser: {
    args: z.object({
      url: z.string().optional(),
      displayId: IDSchema.optional()
    }).strict(),
    returns: IDSchema
  },
  closeBrowser: {
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema
  },
  closeBrowsers: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  setVolume: {
    args: z.object({ volume: z.number() }).strict(),
    returns: StatusSchema
  },
  setSource: {
    args: z.object({
      source: SourceSchemas,
      channel: z.number().optional()
    }).strict(),
    returns: StatusSchema
  },
  mute: { args: z.object({}).strict(), returns: StatusSchema },
  unmute: { args: z.object({}).strict(), returns: StatusSchema },
  muteAudio: { args: z.object({}).strict(), returns: StatusSchema },
  unmuteAudio: { args: z.object({}).strict(), returns: StatusSchema },
  muteVideo: { args: z.object({}).strict(), returns: StatusSchema },
  unmuteVideo: { args: z.object({}).strict(), returns: StatusSchema }
};

/* API Type */

export type ServiceAPIType = typeof ServiceAPI;

/* API Utility Types */

export type ServiceAPIArgs<Key extends keyof ServiceAPIType> = ServiceAPIType[Key]["args"]["shape"];
export type ServiceAPIReturns<Key extends keyof ServiceAPIType> = ServiceAPIType[Key]["returns"];