import {
  APIRoutes,
  isError,
  type TAPIRoutes,
  type TBridgeService,
  type TIsGet
} from "@ove/ove-types";
import { io } from "./sockets";
import { state } from "../state";
import { logger } from "../../env";
import { safe } from "@ove/ove-utils";
import { protectedProcedure, router } from "../trpc";

const getSocket = (socketId: string) => {
  const clientId = state.bridgeClients.get(socketId) ?? null;
  if (clientId === null) return null;
  return io.sockets.get(clientId) ?? null;
};

const generateProcedure =
  <Key extends keyof TBridgeService>(k: Key) => protectedProcedure
    .meta(APIRoutes[k].meta)
    .input<TAPIRoutes[Key]["input"]>(APIRoutes[k].input)
    .output<TAPIRoutes[Key]["output"]>(APIRoutes[k].output);

const handler = async <Key extends keyof TBridgeService, T extends {
  bridgeId: string
}>(k: Key, input: T | undefined) => {
  if (input === undefined) throw new Error("ILLEGAL UNDEFINED");
  if (k === "getPublicKey") throw new Error("ILLEGAL ROUTE");
  const { bridgeId, ...args } = input;
  logger.info(`Handling: ${k}`);

  const res = await safe(logger, () => {
    const socket = getSocket(bridgeId);
    if (socket === null) throw new Error(`${bridgeId} is not connected`);
    // @ts-expect-error arg spread
    return new Promise(resolve => socket.emit<Key>(k, args, resolve));
  });
  if (isError(res)) {
    return {
      meta: {
        bridge: bridgeId
      },
      response: res
    };
  } else return res;
};

const generateQuery =
  <Key extends keyof TBridgeService>(k: Key) => generateProcedure(k)
    .query(({ input }) => handler(k, input));

const generateMutation =
  <Key extends keyof TBridgeService>(k: Key) => generateProcedure(k)
    .mutation(({ input }) => handler(k, input));

type Router = {
  [Key in keyof TAPIRoutes]:
  TIsGet<Key, ReturnType<typeof generateQuery<Key>>,
    ReturnType<typeof generateMutation<Key>>>
}

const routes: Router = Object.entries(APIRoutes).reduce((acc, [k, route]) => {
  acc[k] = route.meta.openapi.method === "GET" ?
    generateQuery(k as keyof typeof APIRoutes) :
    generateMutation(k as keyof typeof APIRoutes);
  return acc;
}, <Record<string, unknown>>{}) as Router;

export const bridgeRouter = router(routes);
