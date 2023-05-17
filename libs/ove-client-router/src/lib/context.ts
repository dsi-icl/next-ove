import { inferAsyncReturnType } from "@trpc/server";
import {
  NodeHTTPCreateContextFnOptions
} from "@trpc/server/dist/adapters/node-http";

export const createInnerContext = async () => ({});

export const createContext = async ({
  req
}: NodeHTTPCreateContextFnOptions<any, any>) => {
  const contextInner = await createInnerContext();
  const user = req.headers.authorization ? req.headers.authorization.split(" ")[1] : null;

  return { user, ...contextInner };
};

export type Context = inferAsyncReturnType<typeof createContext>;
