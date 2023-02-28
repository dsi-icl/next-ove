import { inferAsyncReturnType } from "@trpc/server";
import {Types} from "@ove/ove-client-control";

export const createContext = async () => ({
  browsers: <{[browserId: number]: Types.Browser}>{}
});

export type Context = inferAsyncReturnType<typeof createContext>;
