import { OVEException } from "@ove/ove-types";

export const oveUtils = (): string => "ove-utils";

export const replaceAll = (s: string, xs: any[]): string => {
  const replaceFn = (match: any) => xs[parseInt(match.substring(1)) - 1];
  return s.replaceAll(/\$\d+/g, replaceFn);
};

export const raise = (error: string): OVEException => {
  return { oveError: error };
};

export const omit = <T extends object>(key: keyof T, obj: T): Omit<T, typeof key> => {
  const nObj: T = Object.assign(obj);
  delete nObj[key];
  return nObj;
};