import * as jwt from "jsonwebtoken";
import { nanoid } from "nanoid";

const conditionalPut = <T extends object, Key extends keyof T>(
  k: Key, obj: T[Key] | undefined, acc: T): T => obj === undefined ? acc :
    {
      ...acc,
      [k]: obj
    };

const generateToken = (
  username: string,
  key: string,
  issuer: string,
  expiresIn: string | undefined,
  audience: string | undefined
): string => jwt.sign(
  { username, tokenId: nanoid(32) },
  key,
  conditionalPut("audience", audience,
    conditionalPut("expiresIn", expiresIn, { issuer } as jwt.SignOptions))
);

const service = {
  generateToken
};

export default service;
