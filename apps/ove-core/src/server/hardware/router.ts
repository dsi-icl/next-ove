import { protectedProcedure, router } from "../trpc";
import { io } from "./sockets";
import {
  CoreAPI,
  type TCoreAPI,
  type TCoreAPIOutput,
  type THardwareClientToServerEvents,
  type THardwareServerToClientEvents
} from "@ove/ove-types";
import { type Socket } from "socket.io";
import { state } from "../state";
import { assert } from "@ove/ove-utils";
import { logger } from "../../env";

const getSocket: (socketId: string) => Socket<
  THardwareClientToServerEvents,
  THardwareServerToClientEvents
> = (socketId: string) => assert(io.sockets.get(assert(state.hardwareClients.get(socketId))));

const generateProcedure = <Key extends keyof TCoreAPI>(k: Key) => protectedProcedure
  .meta(CoreAPI[k].meta)
  .input<TCoreAPI[Key]["args"]>(CoreAPI[k].args)
  .output<TCoreAPI[Key]["bridge"]>(CoreAPI[k].bridge);

const generateQuery = <Key extends keyof TCoreAPI>(k: Key) => generateProcedure(k)
  .query<TCoreAPIOutput<Key>>(({ input }): Promise<TCoreAPIOutput<Key>> => {
    if (input === undefined) throw new Error("ILLEGAL UNDEFINED");
    const { bridgeId, ...args } = input;
    logger.info(`Handling: ${k}`);
    // @ts-ignore
    return getSocket(bridgeId).emitWithAck(k, args);
  });

const generateMutation = <Key extends keyof TCoreAPI>(k: Key) => generateProcedure(k)
  .mutation<TCoreAPIOutput<Key>>(({ input }): Promise<TCoreAPIOutput<Key>> => {
    if (input === undefined) throw new Error("ILLEGAL UNDEFINED");
    const { bridgeId, ...args } = input;
    logger.info(`Handling: ${k}`);
    // @ts-ignore
    return getSocket(bridgeId).emitWithAck(k, args);
  });

export type CoreRouter = {
  [Key in keyof TCoreAPI]: TCoreAPI[Key]["meta"]["openapi"]["method"] extends "GET" ?
    ReturnType<typeof generateQuery<Key>> : ReturnType<typeof generateMutation<Key>>
}

const routes: CoreRouter = Object.entries(CoreAPI).reduce((acc, [k, route]) => {
  acc[k] = route.meta.openapi.method === "GET"
    ? generateQuery(k as keyof typeof CoreAPI)
    : generateMutation(k as keyof typeof CoreAPI);
  return acc;
}, <{ [key: string]: unknown }>{}) as CoreRouter;

export const hardwareRouter = router(routes);