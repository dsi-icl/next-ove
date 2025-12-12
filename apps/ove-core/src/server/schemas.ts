import { z } from "zod";

export const UserSchema = z.strictObject({
  id: z.string(),
  username: z.string(),
  email: z.string().nullable(),
  role: z.string(),
  icon: z.string().nullable(),
  name: z.string().nullable(),
});

export const SectionSchema = z.strictObject({
  id: z.string(),
  width: z.number(),
  height: z.number(),
  x: z.number(),
  y: z.number(),
  asset: z.string(),
  assetId: z.string().nullable(),
  states: z.string().array(),
  dataType: z.string(),
  projectId: z.string(),
  ordering: z.number(),
});

export const ProjectSchema = z.strictObject({
  id: z.string(),
  creatorId: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  title: z.string(),
  description: z.string(),
  thumbnail: z.string().nullable(),
  publications: z.string().array(),
  presenterNotes: z.string(),
  notes: z.string(),
  tags: z.string().array(),
  isPublic: z.boolean(),
  bucket: z.string().nullable(),
});

export const ProjectSchemaOutput = ProjectSchema.omit({
  created_at: true,
  updated_at: true,
}).extend({ created_at: z.date(), updated_at: z.date() });

export const InviteSchema = z.strictObject({
  id: z.string(),
  sent: z.date(),
  status: z.string(),
  projectId: z.string(),
  project: ProjectSchemaOutput,
  senderId: z.string(),
  recipientId: z.string(),
  updated_at: z.date(),
});

export const InviteStatusSchema = z.union([
  z.literal("pending"),
  z.literal("accepted"),
  z.literal("declined"),
  z.literal("creator"),
]);
export type InviteStatus = z.infer<typeof InviteStatusSchema>;

export const CollaboratorSchema = z.strictObject({
  status: InviteStatusSchema,
  id: z.string(),
  name: z.string().nullable(),
  icon: z.string().nullable(),
  email: z.string().nullable(),
});

export const DataFormatConfigOptionsSchema = z.strictObject({
  containsHeader: z.boolean().optional(),
  tableSource: z
    .union([z.literal("csv"), z.literal("html"), z.literal("tsv")])
    .optional(),
});

export type DataFormatConfigOptions = z.infer<
  typeof DataFormatConfigOptionsSchema
>;
