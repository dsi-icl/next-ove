import { OVEException } from "@ove/ove-types";

export const oveUtils = (): string => "ove-utils";

export const replaceAll = (s: string, xs: any[]): string => s.replaceAll(/\$\d+/g, (match) => xs[parseInt(match.substring(1)) - 1]);

export const raise = (error: string): OVEException => {
  return { oveError: error };
};