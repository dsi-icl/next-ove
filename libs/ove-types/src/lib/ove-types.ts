import { z } from "zod";

export const ResponseSchema = z.object({ response: z.string() });

export const OVEExceptionSchema = z.object({
  oveError: z.string()
});

export type OVEException = z.infer<typeof OVEExceptionSchema>;

export const is = <T extends z.ZodTypeAny>(
  schema: T,
  obj: unknown
): obj is z.infer<T> => schema.safeParse(obj).success;

export const isAll = <T extends z.ZodTypeAny>(
  schema: T,
  obj: unknown[]
): obj is z.infer<T>[] => z.array(schema).safeParse(obj).success;

export type Tokens = {
  access: string,
  refresh: string
}
