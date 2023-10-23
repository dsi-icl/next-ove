import {
  ClientAPISchema,
  type OpenAPIMethod,
  type OVEException,
  type TClientAPI,
  TClientAPIReturns,
  type TClientService,
  type TClientServiceArgs
} from "@ove/ove-types";
import { logger } from "../../env";
import controller from "./controller";
import { protectedProcedure, router } from "../trpc";

const safeCallController = async <
  Key extends keyof TClientService
>(k: Key, args: TClientServiceArgs<Key>): Promise<TClientAPIReturns<Key>> => {
  try {
    logger.info(`Handling: ${k}`);
    return await controller[k](args) as TClientAPIReturns<Key>;
  } catch (e) {
    logger.error(e);
    return <OVEException>{ oveError: (e as Error).message };
  }
};

const generateProcedure = <Key extends keyof TClientAPI>(k: Key) =>
  protectedProcedure
    .meta(ClientAPISchema[k].meta)
    .input<TClientAPI[Key]["args"]>(ClientAPISchema[k].args)
    .output<TClientAPI[Key]["client"]>(ClientAPISchema[k].client);

const generateQuery = <Key extends keyof TClientAPI>(k: Key) => generateProcedure(k)
  // @ts-ignore
  .query<TClientAPIReturns<Key>>(async ({ input }) => safeCallController<Key>(k, input));

const generateMutation = <Key extends keyof TClientAPI>(k: Key) => generateProcedure(k)
    // @ts-ignore
  .mutation<TClientAPIReturns<Key>>(async ({ input }) => safeCallController<Key>(k, input));

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