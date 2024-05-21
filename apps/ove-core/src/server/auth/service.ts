import * as jwt from "jsonwebtoken";

const generateToken = (
  username: string,
  key: string,
  expiresIn?: string
): string => jwt.sign(
  { username },
  key,
  expiresIn !== undefined ? { expiresIn } : undefined
);

const service = {
  generateToken
};

export default service;
