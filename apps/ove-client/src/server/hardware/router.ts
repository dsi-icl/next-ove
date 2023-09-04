import {
  type TClientAPI,
  type OVEException,
  type TClientService,
  ClientAPISchema,
  type TClientServiceArgs,
  type TClientServiceReturns,
  type ClientRouter
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
    .output<TClientAPI[typeof k]["returns"]>(ClientAPISchema[k].returns);

const generateQuery = <Key extends keyof TClientAPI>(k: Key) => generateProcedure<Key>(k)
  .query<TClientServiceReturns<Key>>(async ({ input }) => safeCallController<Key>(k, input as TClientServiceArgs<Key>));

const generateMutation = <Key extends keyof TClientAPI>(k: Key) => generateProcedure<Key>(k)
  .mutation<TClientServiceReturns<Key>>(async ({ input }) =>
    safeCallController<typeof k>(k, input));

export type TGenerateQuery<Key extends keyof TClientAPI> = typeof generateQuery<Key>
export type TGenerateMutation<Key extends keyof TClientAPI> = typeof generateMutation<Key>

const routes: ClientRouter = Object.entries(ClientAPISchema).reduce((acc, [k, route]) => {
  acc[k] = route.meta.openapi.method === "GET"
    ? generateQuery(k as keyof typeof ClientAPISchema)
    : generateMutation(k as keyof typeof ClientAPISchema);
  return acc;
}, <{ [key: string]: unknown }>{}) as ClientRouter;

export const hardwareRouter = router(routes);