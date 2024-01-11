import { z } from "zod";

export const FileSchema = z.strictObject({
  name: z.string(),
  assetId: z.string(),
  version: z.number(),
  isGlobal: z.boolean()
});

export type File = z.infer<typeof FileSchema>
