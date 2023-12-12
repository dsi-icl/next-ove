import { inferAsyncReturnType } from "@trpc/server";
import {
  NodeHTTPCreateContextFnOptions
} from "@trpc/server/dist/adapters/node-http";
import { prisma } from "./db";

export const createContext = async ({
  req
}: NodeHTTPCreateContextFnOptions<any, any>) => {
  const user: string | null = req.headers.authorization ? (req.headers.authorization as string).split(" ").at(-1) ?? null : null;
  return {
    user,
    prisma
  };
};
export type Context = inferAsyncReturnType<typeof createContext>;
