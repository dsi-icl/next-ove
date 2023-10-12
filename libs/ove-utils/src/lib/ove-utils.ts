import { type OVEException } from "@ove/ove-types";
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

// @ts-ignore
export const DeepProxy = <T extends object>(target: T, onChange: () => void) => {
  let proxyCache = new WeakMap();
  return new Proxy(target, {
    get(target, property) {
      // @ts-ignore
      const item = target[property];
      if (item && typeof item === "object") {
        if (proxyCache.has(item)) return proxyCache.get(item);
        // @ts-ignore
        const proxy = DeepProxy(item, onChange);
        proxyCache.set(item, proxy);
        return proxy;
      }
      return item as any;
    },
    set(target, property, newValue) {
      // @ts-ignore
      target[property] = newValue;
      onChange();
      return true;
    }
  });
};

export const safe = async <T>(logger: TLogger, handler: () => T): Promise<T | OVEException> => {
  try {
    return handler();
  } catch (e) {
    logger.error(e);
    return { oveError: (e as Error).message };
  }
};
