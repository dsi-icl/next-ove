import { protectedProcedure, router } from "../trpc";
import {
  APIRoutes,
  type TAPIRoutes,
  type TBridgeService,
  type TIsGet,
  type TWrappedResponse
} from "@ove/ove-types";
import { state } from "../state";
import { io } from "./sockets";
import { assert } from "@ove/ove-utils";
import { logger } from "../../env";

const getSocket = (socketId: string) => io.sockets.get(assert(state.bridgeClients.get(socketId)));

const generateProcedure = <Key extends keyof TBridgeService>(k: Key) => protectedProcedure
  .meta(APIRoutes[k].meta)
  .input<TAPIRoutes[Key]["input"]>(APIRoutes[k].input)
  .output<TAPIRoutes[Key]["output"]>(APIRoutes[k].output);

const generateQuery = <Key extends keyof TBridgeService>(k: Key) => generateProcedure(k)
  .query<TWrappedResponse<Key>>(({ input }): Promise<TWrappedResponse<Key>> => {
    if (input === undefined) throw new Error("ILLEGAL UNDEFINED");
    const { bridgeId, ...args } = input;
    logger.info(`Handling ${k}`);

    return new Promise<TWrappedResponse<Key>>(resolve => {
      // @ts-ignore
      getSocket(bridgeId).emit<Key>(k, args, resolve);
    });
  });

const generateMutation = <Key extends keyof TBridgeService>(k: Key) => generateProcedure(k)
  .mutation<TWrappedResponse<Key>>(({ input }): Promise<TWrappedResponse<Key>> => {
    if (input === undefined) throw new Error("ILLEGAL UNDEFINED");
    const { bridgeId, ...args } = input;
    logger.info(`Handling ${k}`);

    return new Promise<TWrappedResponse<Key>>(resolve => {
      // @ts-ignore
      getSocket(bridgeId).emit<Key>(k, args, resolve);
    });
  });

type Router = {
  [Key in keyof TAPIRoutes]: TIsGet<Key, ReturnType<typeof generateQuery<Key>>, ReturnType<typeof generateMutation<Key>>>
}

const routes: Router = Object.entries(APIRoutes).reduce((acc, [k, route]) => {
  acc[k] = route.meta.openapi.method === "GET" ? generateQuery(k as keyof typeof APIRoutes) : generateMutation(k as keyof typeof APIRoutes);
  return acc;
}, <Record<string, unknown>>{}) as Router;

export const bridgeRouter = router(routes);