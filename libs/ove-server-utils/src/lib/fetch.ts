/* global URL */
import { z } from "zod";

export const safeFetch = async <T extends z.ZodAny>(
  url: RequestInfo | URL,
  schema: T,
  args?: RequestInit,
): Promise<z.infer<T> | null> => {
  try {
    const raw = await fetch(url, args);
    const res = await raw.json();

    const parsed = schema.safeParse(res);
    return parsed.success ? parsed.data : null;
  } catch (_e) {
    return null;
  }
};
