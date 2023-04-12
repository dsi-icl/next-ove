import { OVEException } from "@ove/ove-types";

export const oveUtils = (): string => "ove-utils";

export const replaceAll = (s: string, xs: string[]): string => {
  const replaceFn = match => xs[parseInt(match.substring(1)) - 1];
  return s.replaceAll(/\$\d+/g, replaceFn);
};

export const raise = (error: string): OVEException => {
  return { oveError: error };
};
