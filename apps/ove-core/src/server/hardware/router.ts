import {
  CoreAPI,
  isError,
  type TCoreAPI,
  type TCoreAPIOutput,
  type THardwareClientToServerEvents,
  type THardwareServerToClientEvents
} from "@ove/ove-types";
import { io } from "./sockets";
import { state } from "../state";
import { logger } from "../../env";
import { safe } from "@ove/ove-utils";
import type { Socket } from "socket.io";
import { protectedProcedure, router } from "../trpc";

const getSocket: (socketId: string) => Socket<
  THardwareClientToServerEvents,
  THardwareServerToClientEvents
> | null = (socketId: string) => {
  const clientId = state.hardwareClients.get(socketId) ?? null;
  if (clientId === null) return null;
  return io.sockets.get(clientId) ?? null;
};

const generateProcedure =
  <Key extends keyof TCoreAPI>(k: Key) => protectedProcedure
    .meta(CoreAPI[k].meta)
    .input<TCoreAPI[Key]["args"]>(CoreAPI[k].args)
    .output<TCoreAPI[Key]["bridge"]>(CoreAPI[k].bridge);

const handler = async <Key extends keyof TCoreAPI, T extends {bridgeId: string}>(k: Key, input: T | undefined): Promise<TCoreAPIOutput<Key>> => {
  if (input === undefined) throw new Error("ILLEGAL UNDEFINED");
  const { bridgeId, ...args } = input;
  logger.info(`Handling: ${k}`);
  const res = await safe(logger, () => {
    const socket = getSocket(bridgeId);
    if (socket === null) throw new Error(`${bridgeId} is not connected`);
    // @ts-expect-error arg spread
    return socket.emitWithAck(k, args)
  });
  if (isError(res)) {
    return {
      meta: {
        bridge: bridgeId
      },
      response: res
    }
  // @ts-expect-error
  } else return res;
};

const generateQuery =
  <Key extends keyof TCoreAPI>(k: Key) => generateProcedure(k)
    .query<TCoreAPIOutput<Key>>(({ input }): Promise<TCoreAPIOutput<Key>> => handler(k, input));

const generateMutation =
  <Key extends keyof TCoreAPI>(k: Key) => generateProcedure(k)
    .mutation<TCoreAPIOutput<Key>>(
      ({ input }): Promise<TCoreAPIOutput<Key>> => handler(k, input));

export type CoreRouter = {
  [Key in keyof TCoreAPI]:
  TCoreAPI[Key]["meta"]["openapi"]["method"] extends "GET" ?
    ReturnType<typeof generateQuery<Key>> :
    ReturnType<typeof generateMutation<Key>>
}

const routes: CoreRouter = Object.entries(CoreAPI).reduce((acc, [k, route]) => {
  acc[k] = route.meta.openapi.method === "GET" ?
    generateQuery(k as keyof typeof CoreAPI) :
    generateMutation(k as keyof typeof CoreAPI);
  return acc;
}, <{ [key: string]: unknown }>{}) as CoreRouter;

export const hardwareRouter = router(routes);
