import { z } from "zod";

export const FileSchema = z.strictObject({
  name: z.string(),
  version: z.string(),
  isGlobal: z.boolean(),
  isLatest: z.boolean()
});

export type File = z.infer<typeof FileSchema>
