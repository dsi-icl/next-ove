import { z } from "zod";

// Type aliases for API
export const ImageSchema = z.string();

export const IDSchema = z.number();

export const DeviceIDSchema = z.string();
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
});

export type MDCSources = z.infer<typeof MDCSourceSchema>;
export const SourceSchemas = z.union([
  MDCSourceSchema.keyof(),
  PJLinkSourceSchema.keyof()
]);

export const DeviceSchema = z.object({
  id: z.string(),
  description: z.string(),
  ip: z.string(),
  port: z.number().optional(),
  protocol: z.string().optional(),
  type: ServiceTypeSchema,
  mac: z.string(),
  tags: z.array(z.string()),
  auth: z.union([z.object({
    password: z.string()
  }), z.boolean()]).nullable()
});

export type Device = z.infer<typeof DeviceSchema>;

export const BrowserSchema = z.strictObject({
  displayId: z.number(),
  url: z.string().optional()
});

export type Browser = z.infer<typeof BrowserSchema>

export const BoundsSchema = z.strictObject({
  width: z.number(),
  height: z.number(),
  rows: z.number(),
  columns: z.number(),
  displays: z.strictObject({
    displayId: z.string(), // ID of screen
    renderer: z.strictObject({
      deviceId: z.string(),
      displayId: z.string() // ID of device's display
    }),
    row: z.number(),
    column: z.number()
  }).array()
});

export type Bounds = z.infer<typeof BoundsSchema>

export const StatusOptionsSchema = z.union([
  z.literal("off"),
  z.literal("on"),
  z.literal("ARP"),
  z.literal("SYN")
]);

export type StatusOptions = z.infer<typeof StatusOptionsSchema>;
