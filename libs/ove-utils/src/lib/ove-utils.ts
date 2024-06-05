/* global Proxy */

// eslint-disable-next-line @nx/enforce-module-boundaries
import type { TLogger } from "@ove/ove-logging";
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { OVEException } from "@ove/ove-types";

export const replaceAll = (s: string, xs: string[]): string => {
  const replaceFn = (match: string) => xs[parseInt(match.substring(1)) - 1];
  return s.replaceAll(/\$\d+/g, replaceFn);
};

export const raise = (error: string): OVEException => {
  return { oveError: error };
};

export const assert = <T>(x: T | undefined | null) => {
  if (x === undefined || x === null) {
    throw new Error("Unexpected null value");
  }
  return x;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const DeepProxy = <T extends object>(
  target: T,
  onChange: () => void
) => {
  const proxyCache = new WeakMap();
  return new Proxy(target, {
    get(target, property) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const item = target[property];
      if (item && typeof item === "object") {
        if (proxyCache.has(item)) return proxyCache.get(item);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const proxy = DeepProxy(item, onChange);
        proxyCache.set(item, proxy);
        return proxy;
      }
      return item;
    },
    set(target, property, newValue) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      target[property] = newValue;
      onChange();
      return true;
    }
  });
};

export const safe = async <T>(
  logger: TLogger,
  handler: () => Promise<T>
): Promise<Awaited<T> | OVEException> => {
  try {
    return await handler();
  } catch (e) {
    logger.error(e);
    if (typeof e === "string") return { oveError: e };
    else if (typeof e === "object" && e !== null && "message" in e) {
      return { oveError: JSON.stringify(e.message) };
    }
    return { oveError: `UNKNOWN: ${JSON.stringify(e)}` };
  }
};

export const recordEquals = <T, U>(
  r1: Record<string, T>,
  r2: Record<string, U>,
  equality: ((k1: string, v1: T, k2: string, v2: U) => boolean) | null = null
): boolean => {
  const entries1 = Object.entries(r1);
  const entries2 = Object.entries(r2);
  if (equality === null) {
    // @ts-expect-error - T and U may overlap
    equality = (k1: string, v1: T, k2: string, v2: U) => k1 === k2 && v1 === v2;
  }

  return entries1.every(([k1, v1]) =>
    entries2.find(([k2, v2]) =>
      assert(equality)(k1, v1, k2, v2)) !== undefined);
};

export const titleToBucketName = (title: string) =>
  title.replaceAll(" ", "-").toLowerCase();
