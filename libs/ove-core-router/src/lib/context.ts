import { inferAsyncReturnType } from "@trpc/server";
import {
  NodeHTTPCreateContextFnOptions
} from "@trpc/server/dist/adapters/node-http";

export const createContext = async ({
  req
}: NodeHTTPCreateContextFnOptions<any, any>) => {
  const user: string | null = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;
  return {
    user
  };
};
export type Context = inferAsyncReturnType<typeof createContext>;
