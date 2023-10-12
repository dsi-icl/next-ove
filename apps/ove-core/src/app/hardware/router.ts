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
  .input<TCoreAPI[typeof k]["args"]>(CoreAPI[k].args)
  .output<TCoreAPI[typeof k]["bridge"]>(CoreAPI[k].bridge);

// unknown need for a generic non-generic function
// @ts-ignore
const generateQuery = <Key extends keyof TCoreAPI>(k: keyof TCoreAPI) => generateProcedure(k)
  .query<TCoreAPIOutput<typeof k>>(({
    input: {
      bridgeId,
      ...args
    }
  }): Promise<TCoreAPIOutput<typeof k>> => {
    logger.info(`Handling: ${k}`);
    return new Promise<TCoreAPIOutput<typeof k>>(resolve => {
      // @ts-ignore
      getSocket(bridgeId).emit<typeof k>(k, args, resolve);
    });
  });

// unknown need for a generic non-generic function
// @ts-ignore
const generateMutation = <Key extends keyof TCoreAPI>(k: keyof TCoreAPI) => generateProcedure(k)
  .mutation<TCoreAPIOutput<typeof k>>(({
    input: {
      bridgeId,
      ...args
    }
  }): Promise<TCoreAPIOutput<typeof k>> => {
    logger.info(`Handling: ${k}`);

    return new Promise<TCoreAPIOutput<typeof k>>(resolve => {
      // @ts-ignore
      getSocket(bridgeId).emit<typeof k>(k, args, resolve);
    });
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