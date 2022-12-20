import { z } from "zod";
import { Logging } from "@ove/ove-utils";
import * as fs from "fs";
import * as path from "path";
import { Device, ResponseCallback } from "./types";
import { environment } from "../environments/environment";

export const logger = Logging.Logger("bridge");

export const getDevices = (): Device[] => JSON.parse(fs.readFileSync(path.join(__dirname, "assets", "hardware.json")).toString());

export const saveDevices = (devices: Device[]) => fs.writeFileSync(path.join(__dirname, "assets", "hardware.json"), JSON.stringify(devices));

export const getTags = (): string[] => getDevices().flatMap(({ tags }) => tags);

export const getIds = (): string[] => getDevices().flatMap(({ id }) => id);

const generateTagRegex = (): RegExp => new RegExp(`^${getTags().join("|")}$`, "gi");

const generateIdRegex = (): RegExp => new RegExp(`^${getIds().join("|")}$`, "gi");

export const wrapCallback = (f: (data: object) => void): ResponseCallback => (data: object): void => f({ "bridge-id": environment.name, "data": data });

export const DeviceSchema = z.object({
  id: z.string(),
  description: z.string(),
  ip: z.string(),
  port: z.number(),
  protocol: z.string().regex(/^mdc|node|projector$/gi),
  mac: z.string(),
  tags: z.array(z.string())
});

export const DeviceIDSchema = z.object({
  id: z.string().regex(generateIdRegex()),
  tag: z.string().regex(generateTagRegex())
}).partial();

export const GetSchema = z.object({
  type: z.string().regex(/^devices|device|info|status|browser$/gi),
  query: z.string().regex(/^system|cpu|memory|battery|graphics|os|processes|fs|usb|printer|audio|network|wifi|bluetooth|docker$/gi).optional()
}).merge(DeviceIDSchema).refine(
  ({ id, tag }) => tag !== undefined ? id === undefined : true,
  "Cannot provide both an ID and a tag"
);

export const PostSchema = z.object({
  type: z.string().regex(/^device|reboot|shutdown|start|execute|screenshot|browser$/gi),
  device: DeviceSchema.optional(),
  command: z.string().optional(),
  method: z.string().optional(),
  format: z.string().optional(),
  screens: z.array(z.string()).optional()
}).merge(DeviceIDSchema).refine(
  ({ id, tag }) => tag !== undefined ? id === undefined : true,
  "Cannot provide both an ID and a tag"
).refine(
  ({type, command}) => type !== "execute" || command !== undefined,
  "Must provide a command when calling execute"
).refine(
  ({type, method, format, screens}) => type !== "screenshot" || (screens !== undefined && format !== undefined && method !== undefined),
  "Must provide method, format and screens when calling screenshot"
);

export const DeleteSchema = z.object({
  type: z.string().regex(/^device|browser$/gi),
  id: z.string().regex(generateIdRegex()).optional()
}).refine(
  ({type, id}) => type !== "device" || id !== undefined,
  "Must provide an ID when calling device"
);

export const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue => {
  if (value === null || value === undefined) return false;
  // noinspection JSUnusedLocalSymbols
  const dummy: TValue = value;
  return true;
};
