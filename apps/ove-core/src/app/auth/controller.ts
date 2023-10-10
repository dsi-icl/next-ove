import { env } from "../../env";
import { TRPCError } from "@trpc/server";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { type Tokens } from "@ove/ove-types";
import { type Context } from "../context";

const generateToken = (
  username: string,
  key: string,
  expiresIn?: string
): string => jwt.sign(
  { username },
  key,
  expiresIn !== undefined ? { expiresIn } : undefined
);

const login = async (ctx: Context): Promise<Tokens> => {
  if (ctx.user === null) throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "No credentials provided"
  });
  const [username, password] = decodeURIComponent(
    Buffer.from(ctx.user, "base64url").toString()).split(":");
  const user = await ctx.prisma.auth.findUnique({
    where: {
      username
    }
  });

  if (user === null) throw new TRPCError({
    code: "UNAUTHORIZED",
    message: `No user found with username: ${username}`
  });

  let authorised = false;

  try {
    authorised = await bcrypt.compare(password, user.password);
  } catch (e) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Unknown authorization failure, please contact admin"
    });
  }

  if (!authorised) throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "Incorrect password"
  });

  const accessToken = generateToken(username, env.ACCESS_TOKEN_SECRET, "24h");
  const refreshToken = generateToken(username, env.REFRESH_TOKEN_SECRET);

  await ctx.prisma.refresh.upsert({
    where: {
      userId: user.id
    },
    create: {
      token: refreshToken,
      userId: user.id
    },
    update: {
      token: refreshToken
    }
  });

  return { access: accessToken, refresh: refreshToken };
};

const getToken = async (ctx: Context) => {
  if (ctx.user === null) throw new TRPCError({
    code: "UNAUTHORIZED",
    message: "No credentials provided"
  });
  const tokenRecord = await ctx.prisma.refresh.findUnique({
    where: {
      token: ctx.user
    }
  });

  if (tokenRecord === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Invalid token"
    });
  }

  let user: { username: string };

  try {
    user = jwt.verify(ctx.user, env.REFRESH_TOKEN_SECRET) as {
      username: string
    };
  } catch (e) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid token" });
  }

  return generateToken(user.username, env.ACCESS_TOKEN_SECRET, "24h");
};

export default {
  login,
  getToken
};