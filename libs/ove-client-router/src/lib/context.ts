import { inferAsyncReturnType } from "@trpc/server";

export const createInnerContext = async () => ({});

export const createContext = async () => {
  const contextInner = await createInnerContext();
  return { ...contextInner };
};

export type Context = inferAsyncReturnType<typeof createInnerContext>;
