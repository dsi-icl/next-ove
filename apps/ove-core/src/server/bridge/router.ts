import {
  APIRoutes,
  type TAPIRoutes,
  type TBridgeService,
  TBridgeServiceReturn,
  type TIsGet,
} from "@ove/ove-types";
import { io } from "./sockets";
import { state } from "../state";
import { logger } from "../../env";
import { wrapSocketCall } from "../tracing";
import { adminProcedure, router } from "../trpc";

const getSocket = (socketId: string) => {
  const clientId = state.bridgeClients.get(socketId) ?? null;
  if (clientId === null) return null;
  return io.sockets.get(clientId) ?? null;
};

const generateProcedure = <Key extends keyof TBridgeService>(k: Key) =>
  adminProcedure
    .meta(APIRoutes[k].meta)
    .input<TAPIRoutes[Key]["input"]>(APIRoutes[k].input)
    .output<TAPIRoutes[Key]["output"]>(APIRoutes[k].output);

const handler = async <
  Key extends keyof TBridgeService,
  T extends {
    bridgeId: string;
  },
>(
  k: Key,
  input: T | undefined,
): Promise<TBridgeServiceReturn<Key>> => {
  if (input === undefined) throw new Error("ILLEGAL UNDEFINED");
  const { bridgeId, ...args } = input;
  logger.info(`Handling: ${k}`);
  const socket = getSocket(bridgeId);
  if (socket === null) throw new Error(`${bridgeId} is not connected`);
  return wrapSocketCall(k, async () => {
    // @ts-expect-error arg spread
    const res = await socket.emitWithAck(k, args);
    if (res.status === "error") throw new Error(res.error);
    return res.data;
  });
};

const generateQuery = <Key extends keyof TBridgeService>(k: Key) =>
  generateProcedure(k).query<TAPIRoutes[Key]["output"]>(
    // doesn't affect output type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ input }) => handler(k, input) as any,
  );

const generateMutation = <Key extends keyof TBridgeService>(k: Key) =>
  generateProcedure(k).mutation<TAPIRoutes[Key]["output"]>(
    // doesn't affect output type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ input }) => handler(k, input) as any,
  );

type Router = {
  [Key in keyof TAPIRoutes]: TIsGet<
    Key,
    ReturnType<typeof generateQuery<Key>>,
    ReturnType<typeof generateMutation<Key>>
  >;
};

const routes: Router = Object.entries(APIRoutes).reduce(
  (acc, [k, route]) => {
    acc[k] =
      route.meta.openapi.method === "GET"
        ? generateQuery(k as keyof typeof APIRoutes)
        : generateMutation(k as keyof typeof APIRoutes);
    return acc;
  },
  <Record<string, unknown>>{},
) as Router;

export const bridgeRouter = router(routes);
