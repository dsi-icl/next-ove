/* global Proxy */

// eslint-disable-next-line @nx/enforce-module-boundaries
import { type OVEException } from "@ove/ove-types";
// eslint-disable-next-line @nx/enforce-module-boundaries
import { type TLogger } from "@ove/ove-logging";

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
