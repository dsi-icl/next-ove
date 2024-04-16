import { env } from "../../env";
import * as jwt from "jsonwebtoken";

export const isAuthed = (
  username: string | null
): "disabled" | null | string | "unauthorised" => {
  if (env.DISABLE_AUTH) {
    return "disabled";
  }

  if (username === null || env.ACCESS_TOKEN_SECRET === undefined) {
    return null;
  }

  try {
    return (jwt.verify(username,
      env.ACCESS_TOKEN_SECRET) as unknown as { username: string }).username;
  } catch (e) {
    return "unauthorised";
  }
};
