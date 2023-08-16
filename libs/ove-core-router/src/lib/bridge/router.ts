import { protectedProcedure, router } from "../trpc";
import {
  APIRoutes,
  TAPIRoutes,
  TBridgeService,
  TIsGet,
  TWrappedResponse
} from "@ove/ove-types";
import { state } from "../state";
import { io } from "./sockets";
import { mapObject2 } from "@ove/ove-utils";

const getSocket = (socketId: string) => io.sockets.get(state.bridgeClients.get(socketId));

const generateProcedure = <Key extends keyof TBridgeService>(k: Key) => protectedProcedure
  .meta(APIRoutes[k].meta)
  .input<TAPIRoutes[Key]["input"]>(APIRoutes[k].input)
  .output<TAPIRoutes[Key]["output"]>(APIRoutes[k].output);

const generateQuery = <Key extends keyof TBridgeService>(k: Key) => generateProcedure(k)
  .query<TWrappedResponse<Key>>(async ({
    input: {
      bridgeId,
      ...args
    }
  }) =>
    new Promise<TWrappedResponse<Key>>(resolve => {
      // @ts-ignore
      getSocket(bridgeId).emit<Key>(k, args, resolve);
    }));

const generateMutation = <Key extends keyof TBridgeService>(k: Key) => generateProcedure(k)
  .mutation<TWrappedResponse<Key>>(async ({
    input: {
      bridgeId,
      ...args
    }
  }) => new Promise<TWrappedResponse<Key>>(resolve => {
    // @ts-ignore
    getSocket(bridgeId).emit<Key>(k, args, resolve);
  }));

type Router = {
  [Key in keyof TAPIRoutes]: TIsGet<Key, ReturnType<typeof generateQuery<Key>>, ReturnType<typeof generateMutation<Key>>>
}

const routes: Router = mapObject2(APIRoutes, (k, v) => {
  return [k, (v.meta.openapi.method === "GET" ?
    generateQuery(k) : generateMutation(k)) as Router[typeof k]];
});

export const bridgeRouter = router(routes);