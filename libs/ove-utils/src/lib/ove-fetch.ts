// global console, window, fetch

import { z } from "zod";

// @ts-ignore
export const safeFetch = async <T extends z.ZodAny>(url: URL | RequestInfo, schema: T, args?: RequestInit): Promise<z.infer<T> | null> => {
  // @ts-ignore
  if (window === undefined) {
    console.error("Attempting to use browser version of safeFetch in a server environment");
    return null;
  }
  try {
    // @ts-ignore
    const raw = await fetch(url, args);
    const res = await raw.json();

    const parsed = schema.safeParse(res);
    return parsed.success ? parsed.data : null;
  } catch (e) {
    return null;
  }
};