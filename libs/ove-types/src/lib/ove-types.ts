import { z } from "zod";

export const ResponseSchema = z.object({ response: z.string() });

export const OVEExceptionSchema = z.strictObject({
  oveError: z.string()
});

export type OVEException = z.infer<typeof OVEExceptionSchema>;

export const is = <T extends z.ZodTypeAny>(
  schema: T,
  obj: unknown
): obj is z.infer<T> => schema.safeParse(obj).success;

export const isError = (
  obj: unknown
): obj is OVEException => obj !== undefined &&
  obj !== null && typeof obj === "object" && "oveError" in obj;

export const isAll = <T extends z.ZodTypeAny>(
  schema: T,
  obj: unknown[]
): obj is z.infer<T>[] => z.array(schema).safeParse(obj).success;

export type Tokens = {
  access: string,
  refresh: string
}

export const PowerModeSchema = z.union([
  z.literal("manual"),
  z.literal("auto"),
  z.literal("eco")
]);
export type PowerMode = z.infer<typeof PowerModeSchema>

export const CalendarEventSchema = z.strictObject({
  title: z.string(),
  start: z.date(),
  end: z.date()
});

export type CalendarEvent = z.infer<typeof CalendarEventSchema>

export const CalendarSchema = z.strictObject({
  value: z.array(z.strictObject({
    title: z.string(),
    start: z.string(),
    end: z.string()
  })),
  lastUpdated: z.string().nullable()
});

export type Calendar = z.infer<typeof CalendarSchema>;

export type NativeEvent = {
  submitter: {
    name: string
  }
}

export const AutoScheduleSchema = z.strictObject({
  wake: z.string().nullable(),
  sleep: z.string().nullable(),
  schedule: z.array(z.boolean())
});

export type AutoSchedule = z.infer<typeof AutoScheduleSchema>;
