import {
  type TClientAPI,
  type OVEException,
  type TClientService,
  ClientAPISchema,
  type TClientServiceArgs,
  type TClientServiceReturns,
  type OpenAPIMethod, TClientAPIReturns
} from "@ove/ove-types";
import controller from "./controller";
import { logger } from "../../env";
import { protectedProcedure, router } from "../trpc";

const safeCallController = async <
  Key extends keyof TClientService
>(k: Key, args: TClientServiceArgs<Key>): Promise<TClientServiceReturns<Key>> => {
  try {
    return await controller[k](args);
  } catch (e) {
    logger.error(e);
    return <OVEException>{ oveError: (e as Error).message };
  }
};

const generateProcedure = <Key extends keyof TClientAPI>(k: Key) =>
  protectedProcedure
    .meta(ClientAPISchema[k].meta)
    .input<TClientAPI[typeof k]["args"]>(ClientAPISchema[k].args)
    .output<TClientAPI[typeof k]["client"]>(ClientAPISchema[k].client);

// unknown need for a non-generic generic function
// @ts-ignore
const generateQuery = <Key extends keyof TClientAPI>(k: keyof TClientAPI) => generateProcedure(k)
  .query<TClientAPIReturns<typeof k>>(async ({ input }) => safeCallController<typeof k>(k, input as TClientServiceArgs<typeof k>));

// unknown need for a non-generic generic function
// @ts-ignore
const generateMutation = <Key extends keyof TClientAPI>(k: keyof TClientAPI) => generateProcedure(k)
  .mutation<TClientAPIReturns<typeof k>>(async ({ input }) =>
    safeCallController<typeof k>(k, input));

export type ClientRouter = {
  [Key in keyof TClientAPI]: OpenAPIMethod<Key> extends "GET" ?
    ReturnType<typeof generateQuery<Key>> : ReturnType<typeof generateMutation<Key>>
}

const routes: ClientRouter = Object.entries(ClientAPISchema).reduce((acc, [k, route]) => {
  acc[k] = route.meta.openapi.method === "GET"
    ? generateQuery(k as keyof typeof ClientAPISchema)
    : generateMutation(k as keyof typeof ClientAPISchema);
  return acc;
}, <{ [key: string]: unknown }>{}) as ClientRouter;

export const hardwareRouter = router(routes);