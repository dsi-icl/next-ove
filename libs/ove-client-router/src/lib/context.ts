import { inferAsyncReturnType } from "@trpc/server";
import { Browser } from "@ove/ove-types";

export const createInnerContext = async () => ({
  browsers: <{ [browserId: number]: Browser }>{}
});

export const createContext = async () => {
  const contextInner = await createInnerContext();

  return {
    ...contextInner
  };
};

export type Context = inferAsyncReturnType<typeof createInnerContext>;
