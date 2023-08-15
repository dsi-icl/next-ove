import { z } from "zod";

// Type aliases for API
export type Image = string;
export const ImageSchema = z.string();

export type ID = number;
export const IDSchema = z.number();

export const DeviceIDSchema = z.string();
export type Status = boolean;
export const StatusSchema = z.boolean();

export type Optional<T> = T | undefined;

export const ScreenshotMethodSchema = z.union([
  z.literal("upload"),
  z.literal("local"),
  z.literal("response")
]);
export type ScreenshotMethod = z.infer<typeof ScreenshotMethodSchema>;

export const PJLinkSourceSchema = z.object({
  RGB: z.literal(1),
  VIDEO: z.literal(2),
  DIGITAL: z.literal(3),
  STORAGE: z.literal(4),
  NETWORK: z.literal(5)
}).strict();

export type PJLinkSource = z.infer<typeof PJLinkSourceSchema>;

export const ServiceTypeSchema = z.union([
  z.literal("node"),
  z.literal("mdc"),
  z.literal("pjlink")
]);
export type ServiceType = z.infer<typeof ServiceTypeSchema>;

export const MDCSourceSchema = z.object({
  UNKNOWN: z.number(),
  PC: z.number(),
  DVI: z.number(),
  DVI_VIDEO: z.number(),
  AV: z.number(),
  SVIDEO: z.number(),
  COMPONENT: z.number(),
  MAGICNET: z.number(),
  TV: z.number(),
  DTV: z.number(),
  HDMI1: z.number(),
  HDMI1_PC: z.number(),
  HDMI2: z.number(),
  HDMI2_PC: z.number(),
  DP: z.number(),
  DP2: z.number(),
  DP3: z.number()
}).strict();

export type MDCSources = z.infer<typeof MDCSourceSchema>;
export const SourceSchemas = z.union([
  MDCSourceSchema.keyof(),
  PJLinkSourceSchema.keyof()
]);

export type Source = z.infer<typeof SourceSchemas>

export const DeviceSchema = z.object({
  id: z.string(),
  description: z.string(),
  ip: z.string(),
  port: z.number(),
  protocol: z.string(),
  type: ServiceTypeSchema,
  mac: z.string(),
  tags: z.array(z.string()),
  auth: z.union([z.object({username: z.string(), password: z.string()}), z.boolean()]).nullable()
});

export type Device = z.infer<typeof DeviceSchema>;

export type Browser = {
  idx: string
};
