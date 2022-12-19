import { z } from "zod";
import { Logging } from "@ove/ove-utils";
import * as fs from "fs";
import * as path from "path";
import { Device } from "./types";
import { environment } from "../environments/environment";

export const logger = Logging.Logger("bridge");

export const getDevices = (): Device[] => JSON.parse(fs.readFileSync(path.join(__dirname, "assets", "hardware.json")).toString());

export const saveDevices = (devices: Device[]) => fs.writeFileSync(path.join(__dirname, "assets", "hardware.json"), JSON.stringify(devices));

export const getTags = (): string[] => getDevices().flatMap(({ tags }) => tags);

export const getIds = (): string[] => getDevices().flatMap(({ id }) => id);

const generateTagRegex = () => new RegExp(`^${getTags().join("|")}$`, "gi");

const generateIdRegex = () => new RegExp(`^${getIds().join("|")}$`, "gi");

export const wrapCallback = f => data => f({ "bridge-id": environment.name, "data": data });

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
  type: z.string().regex(/^devices|device$/gi)
}).merge(DeviceIDSchema).refine(
  ({ id, tag }) => tag !== undefined ? id === undefined : true,
  "Cannot provide both an ID and a tag"
);

export const PostSchema = z.object({
  type: z.string().regex(/^device|reboot|shutdown|start$/gi),
  device: DeviceSchema.optional()
}).merge(DeviceIDSchema).refine(
  ({ id, tag }) => tag !== undefined ? id === undefined : true,
  "Cannot provide both an ID and a tag"
);

export const DeleteSchema = z.object({
  type: z.string().regex(/^device$/gi),
  id: z.string().regex(generateIdRegex()).optional()
});
