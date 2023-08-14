import { OVEException } from "@ove/ove-types";

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
export const DeepProxy = <T extends object>(target: T, onChange: (target: T) => void) => {
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
        return proxy as any;
      }
      return item as any;
    },
    set(target, property, newValue) {
      // @ts-ignore
      target[property] = newValue;
      onChange(target);
      return true;
    }
  });
};

export const mapObject = <A, B, T extends Record<string, A>, U extends Record<keyof T, B>>(obj: T, transformer: <K extends keyof T>(k: K, v: T[K], m: U) => void): U => {
  const mapped = {} as U;
  (Object.keys(obj) as Array<keyof T>).forEach(k => {
    transformer(k, obj[k], mapped);
  });
  return mapped;
};

export const filterObject = <A, T extends Record<string, A>, U extends Record<keyof T, A>>(obj: T, filter: (k: keyof T) => boolean): U => {
  const filtered = {} as U;
  for (let key of Object.keys(obj) as Array<keyof T>) {
    if (!filter(key)) continue;
    // @ts-ignore
    filtered[key] = obj[key];
  }

  return filtered;
};
