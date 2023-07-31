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

export const PowerModeSchema = z.union([z.literal("manual"), z.literal("auto"), z.literal("eco")]);
export type PowerMode = z.infer<typeof PowerModeSchema>

export type CalendarEvent = {
  title: string
  start: Date
  end: Date
}

export type OutlookEvents = {
  value: {
    subject: string
    start: {
      dateTime: string
    }
    end: {
      dateTime: string
    }
  }[]
  lastUpdated: string | null
}

export type NativeEvent = {
  submitter: {
    name: string
  }
}

export type AutoSchedule = {
  wake: string | null
  sleep: string | null
  schedule: boolean[]
}