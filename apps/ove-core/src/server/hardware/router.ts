import {
  CoreAPI,
  type TCoreAPI,
  type TCoreAPIOutput,
  type THardwareClientToServerEvents,
  type THardwareServerToClientEvents,
} from "@ove/ove-types";
import { io } from "./sockets";
import { state } from "../state";
import type { Socket } from "socket.io";
import { injectTrace, wrapSocketCall } from "../tracing";
import { adminProcedure, procedure, router } from "../trpc";

const getSocket: (
  socketId: string,
) => Socket<
  THardwareClientToServerEvents,
  THardwareServerToClientEvents
> | null = (socketId: string) => {
  const clientId = state.hardwareClients.get(socketId) ?? null;
  if (clientId === null) return null;
  return io.sockets.get(clientId) ?? null;
};

const generateProcedure = <Key extends keyof TCoreAPI>(k: Key) =>
  (CoreAPI[k].meta.admin ? adminProcedure : procedure)
    .meta(CoreAPI[k].meta)
    .input<TCoreAPI[Key]["args"]>(CoreAPI[k].args)
    .output<TCoreAPI[Key]["returns"]>(CoreAPI[k].returns);

const handler = async <
  Key extends keyof TCoreAPI,
  T extends {
    bridgeId: string;
  },
>(
  k: Key,
  input: T | undefined,
): Promise<TCoreAPIOutput<Key>> => {
  if (input === undefined) throw new Error("ILLEGAL UNDEFINED");
  const { bridgeId, ...args } = input;
  const socket = getSocket(bridgeId);
  if (socket === null) throw new Error(`${bridgeId} is not connected`);
  return wrapSocketCall(k, async () => {
    // @ts-expect-error arg spread
    const res = await socket.emitWithAck(k, { ...args, __otel: injectTrace() });
    if (res.status === "error") throw new Error(res.error);
    return res.data;
  });
};

const generateQuery = <Key extends keyof TCoreAPI>(k: Key) =>
  generateProcedure(k).query<TCoreAPIOutput<Key>>(
    ({ input }) =>
      // doesn't affect output type
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      handler(k, input) as any,
  );

const generateMutation = <Key extends keyof TCoreAPI>(k: Key) =>
  generateProcedure(k).mutation<TCoreAPIOutput<Key>>(
    // doesn't affect output type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ({ input }) => handler(k, input) as any,
  );

export type CoreRouter = {
  [Key in keyof TCoreAPI]: TCoreAPI[Key]["meta"]["openapi"]["method"] extends "GET"
    ? ReturnType<typeof generateQuery<Key>>
    : ReturnType<typeof generateMutation<Key>>;
};

const routes: CoreRouter = Object.entries(CoreAPI).reduce(
  (acc, [k, route]) => {
    acc[k] =
      route.meta.openapi.method === "GET"
        ? generateQuery(k as keyof typeof CoreAPI)
        : generateMutation(k as keyof typeof CoreAPI);
    return acc;
  },
  <{ [key: string]: unknown }>{},
) as CoreRouter;

export const hardwareRouter = router(routes);
