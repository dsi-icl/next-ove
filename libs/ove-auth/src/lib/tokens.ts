import type { TokenPayload } from "@ove/ove-types";
import * as jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import { conditionalPut } from "./utils";

export const generateToken = (
  payload: TokenPayload,
  secret: { key: string; passphrase: string },
  issuer: string,
  algorithm: jwt.Algorithm,
  expiresIn: string | undefined,
  audience: string[] | undefined,
): string =>
  jwt.sign(
    { ...payload, tokenId: nanoid(16) },
    secret,
    conditionalPut(
      "audience",
      audience,
      conditionalPut(
        "expiresIn",
        expiresIn as jwt.SignOptions["expiresIn"],
        {
          issuer,
          algorithm,
        } as jwt.SignOptions,
      ),
    ),
  );
