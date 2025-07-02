import express from "express";

export type AuthValidation = { username: string; role: string };

export interface Request extends express.Request {
  username?: string;
  role?: string;
  to?: string;
}

export const conditionalPut = <T extends object, Key extends keyof T>(
  k: Key,
  obj: T[Key] | undefined,
  acc: T,
): T =>
  obj === undefined
    ? acc
    : {
        ...acc,
        [k]: obj,
      };
