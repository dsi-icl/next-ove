import { z } from "zod";
import { generateIdRegex, generateTagRegex } from "./utils";
import { DeviceSchema } from "../../../../libs/ove-types/src/lib/hardware";

export const DeviceIDSchema = z.object({
  id: z.string().regex(generateIdRegex()),
  tag: z.string().regex(generateTagRegex())
}).partial();
z.object({
  type: z.string().regex(/^devices|device|info|status|browser$/gi),
  query: z.string().regex(/^system|cpu|memory|battery|graphics|os|processes|fs|usb|printer|audio|network|wifi|bluetooth|docker$/gi).optional()
}).merge(DeviceIDSchema).refine(
  ({ id, tag }) => tag !== undefined ? id === undefined : true,
  "Cannot provide both an ID and a tag"
);
z.object({
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
z.object({
  type: z.string().regex(/^device|browser$/gi),
  id: z.string().regex(generateIdRegex()).optional()
}).refine(
  ({type, id}) => type !== "device" || id !== undefined,
  "Must provide an ID when calling device"
);
