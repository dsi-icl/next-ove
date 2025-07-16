import type { TokenPayload } from "@ove/ove-types";
import { generateToken } from "./tokens";
import * as jwt from "jsonwebtoken";
import type { AuthValidation, Request } from "./utils";
import type { NextFunction, Response } from "express";

type OTPConfig = {
  SIGNING_KEYS: {
    PRIVATE: string;
    PASSPHRASE: string;
    PUBLIC: string;
  };
  OTP: {
    ISSUER: string;
    ALGORITHM: jwt.Algorithm;
    EXPIRY: string;
    AUDIENCE: string[];
  };
};

const extractOTP = (req: Request) => {
  const otp = req.query?.["otp"];

  if (otp === null || otp === undefined || typeof otp !== "string")
    throw new Error("Missing OTP query parameter");
  return otp;
};

const validateOTP = async (otp: string, otps: Set<string>, config: OTPConfig): Promise<AuthValidation> => {
  if (!otps.has(otp)) throw new Error("OTP revoked");
  return jwt.verify(otp, config.SIGNING_KEYS.PUBLIC, {
    issuer: config.OTP.ISSUER,
    audience: config.OTP.AUDIENCE,
    algorithms: [config.OTP.ALGORITHM],
  }) as { username: string; role: string };
};

export const generateOTP = (payload: TokenPayload, otpConfig: OTPConfig) =>
  generateToken(
    payload,
    {
      key: otpConfig.SIGNING_KEYS.PRIVATE,
      passphrase: otpConfig.SIGNING_KEYS.PASSPHRASE,
    },
    otpConfig.OTP.ISSUER,
    otpConfig.OTP.ALGORITHM,
    otpConfig.OTP.EXPIRY,
    otpConfig.OTP.AUDIENCE,
  );

export const otpMiddleware = async (otps: Set<string>, req: Request, res: Response, next: NextFunction, config: OTPConfig, authorize: (role: string, url: string) => boolean,
  credentials: { username: string; role: string; } | undefined = undefined,
) => {
  if (credentials !== undefined) {
    req.username = credentials.username;
    req.role = credentials.role;
    next();
    return;
  }
  try {
    const otp = extractOTP(req);

    const { role, username } = await validateOTP(otp, otps, config);
    if (!authorize(role, req.originalUrl)) {
      res.sendStatus(403);
      return;
    }

    req.role = role;
    req.username = username;

    next();
  } catch (_e) {
    res.sendStatus(401);
  }
};
