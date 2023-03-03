import { inferAsyncReturnType } from "@trpc/server";
import {Types} from "@ove/ove-client-control";

export const createInnerContext = async () => ({
  browsers: <{[browserId: number]: Types.Browser}>{}
});

export const createContext = async () => {
  const contextInner = await createInnerContext();

  return {
    ...contextInner
  };
};

export type Context = inferAsyncReturnType<typeof createInnerContext>;
