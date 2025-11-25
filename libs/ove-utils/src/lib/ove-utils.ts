/* global Proxy */

// eslint-disable-next-line @nx/enforce-module-boundaries
import type { Device } from "@ove/ove-types";

export const replaceAll = (s: string, xs: string[]): string => {
  const replaceFn = (match: string) => xs[parseInt(match.substring(1)) - 1];
  return s.replaceAll(/\$\d+/g, replaceFn);
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
  onChange: () => void,
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
    },
  });
};

export const recordEquals = <T, U>(
  r1: Record<string, T>,
  r2: Record<string, U>,
  equality: ((k1: string, v1: T, k2: string, v2: U) => boolean) | null = null,
): boolean => {
  const entries1 = Object.entries(r1);
  const entries2 = Object.entries(r2);
  if (equality === null) {
    // @ts-expect-error - T and U may overlap
    equality = (k1: string, v1: T, k2: string, v2: U) => k1 === k2 && v1 === v2;
  }

  return entries1.every(
    ([k1, v1]) =>
      entries2.find(([k2, v2]) => assert(equality)(k1, v1, k2, v2)) !==
      undefined,
  );
};

export const titleToBucketName = (title: string) =>
  title.replaceAll(" ", "-").toLowerCase();

export const fixedEncodeURI = (str: string) =>
  encodeURI(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16));

export const generateUUID = () =>
  "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });

export const buildDeviceURL = (device: Device) => {
  const protocol = device.protocol !== undefined ? `${device.protocol}://` : "";
  const hostname = device.host;
  const port = device.port !== undefined ? `:${device.port}` : "";
  return `${protocol}${hostname}${port}`;
};

export const filterRejected = (
  x: PromiseSettledResult<unknown>,
): x is PromiseRejectedResult => {
  return (
    x !== undefined &&
    typeof x === "object" &&
    x !== null &&
    "status" in x &&
    x.status === "rejected"
  );
};

export const filterFulfilled = <T>(
  x: PromiseSettledResult<T>,
): x is PromiseFulfilledResult<T> => {
  return (
    x !== undefined &&
    typeof x === "object" &&
    x !== null &&
    "status" in x &&
    x.status === "fulfilled"
  );
};
