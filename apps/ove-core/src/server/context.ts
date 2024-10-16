import { s3 } from "./s3";
import { prisma } from "./db";
import type {
  NodeHTTPCreateContextFnOptions
} from "@trpc/server/dist/adapters/node-http";
import type { inferAsyncReturnType } from "@trpc/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ContextOptions = NodeHTTPCreateContextFnOptions<any, any>

export const createContext = async ({ req }: ContextOptions) => {
  const user: string | null = req.headers.authorization ?
    (req.headers.authorization as string).split(" ").at(-1) ?? null :
    null;
  return {
    user,
    prisma,
    s3
  };
};
export type Context = inferAsyncReturnType<typeof createContext>;
