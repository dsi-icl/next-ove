/* global console, window, fetch, URL, RequestInfo, RequestInit */

import { z } from "zod";

export const safeFetch = async <T extends z.ZodAny>(
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  url: URL | RequestInfo,
  schema: T,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  args?: RequestInit
): Promise<z.infer<T> | null> => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (window === undefined) {
    console.error("Attempting to use browser version of safeFetch" +
      " in a server environment");
    return null;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const raw = await fetch(url, args);
    const res = await raw.json();

    const parsed = schema.safeParse(res);
    return parsed.success ? parsed.data : null;
  } catch (e) {
    return null;
  }
};
