import { env } from "../../env";
import * as jwt from "jsonwebtoken";
import type { PrismaClient } from "@prisma/client";

export const isAuthed = async (
  prisma: PrismaClient,
  username: string | null
): Promise<"disabled" | null | string | "unauthorised"> => {
  if (env.DISABLE_AUTH) {
    return "disabled";
  }

  if (username === null || env.TOKENS.ACCESS.SECRET === undefined) {
    return null;
  }

  try {
    username = (jwt.verify(username,
      env.TOKENS.ACCESS.SECRET, {
        issuer: env.TOKENS.ACCESS.ISSUER,
        audience: env.TOKENS.ACCESS.ISSUER
      }) as unknown as { username: string }).username;
    const user = await prisma.user.findUniqueOrThrow({
      where: {
        username
      }
    });
    await prisma.refreshToken.findUniqueOrThrow({
      where: {
        userId: user.id
      }
    });
    return username;
  } catch (e) {
    return "unauthorised";
  }
};
