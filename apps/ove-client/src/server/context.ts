import { inferAsyncReturnType } from "@trpc/server";
import {
  NodeHTTPCreateContextFnOptions
} from "@trpc/server/dist/adapters/node-http";

export const createInnerContext = async () => ({});

export const createContext = async ({
  req
}: NodeHTTPCreateContextFnOptions<any, any>) => {
  const contextInner = await createInnerContext();
  const user = req.headers.authorization ? decodeURIComponent(req.headers.authorization).split(" ").slice(1).join(" ") : null;

  return { user, ...contextInner };
};

export type Context = inferAsyncReturnType<typeof createContext>;
