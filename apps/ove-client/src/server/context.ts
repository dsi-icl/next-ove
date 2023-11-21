import { inferAsyncReturnType } from "@trpc/server";
import {
  NodeHTTPCreateContextFnOptions
} from "@trpc/server/dist/adapters/node-http";

export const createInnerContext = async () => ({});

export const createContext = async <T extends object, U extends object>(
  { req }: NodeHTTPCreateContextFnOptions<T, U>
) => {
  const authorization = (req as {headers: {authorization: string}})
    .headers.authorization;
  const contextInner = await createInnerContext();
  const user = authorization ? decodeURIComponent(authorization)
    .split(" ").slice(1).join(" ") : null;

  return { user, ...contextInner };
};

export type Context = inferAsyncReturnType<typeof createContext>;
