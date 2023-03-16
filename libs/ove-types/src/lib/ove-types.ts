import { z } from "zod";

export const ResponseSchema = z.object({ response: z.string() });

export type Response = z.infer<typeof ResponseSchema>;

export const OVEExceptionSchema = z.object({
  oveError: z.string()
});

export type OVEException = z.infer<typeof OVEExceptionSchema>;

export const is = <T extends z.ZodTypeAny>(schema: T, obj: any): obj is z.infer<T> => schema.safeParse(obj).success;
export const isNot = <T extends z.ZodTypeAny, U>(schema: T, obj: U | z.infer<T>): obj is Exclude<typeof obj, z.infer<T>> => !schema.safeParse(obj).success;

export const filterIs = <T extends z.ZodTypeAny>(schema: T): (obj: any) => obj is z.infer<T> => (obj: any): obj is z.infer<T> => schema.safeParse(obj).success;

export const filterIsNot = <T extends z.ZodTypeAny, U>(schema: T): (obj: U | z.infer<T>) => obj is Exclude<typeof obj, z.infer<T>> => (obj: U | z.infer<T>): obj is Exclude<typeof obj, z.infer<T>> => !schema.safeParse(obj).success;

export const isAll = <T extends z.ZodTypeAny>(schema: T, obj: any[]): obj is z.infer<T>[] => z.array(schema).safeParse(obj).success;

export const isNotAll = <T extends z.ZodTypeAny, U>(schema: T, obj: (U | z.infer<T>)[]): obj is Exclude<typeof obj, z.infer<T>> => !schema.safeParse(obj).success;

export const isDefined = <T>(obj: T | undefined): obj is Exclude<typeof obj, undefined> => obj !== undefined;