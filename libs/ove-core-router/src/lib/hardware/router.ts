import { protectedProcedure, router } from "../trpc";
import { io } from "./sockets";
import {
  CoreAPI,
  CoreAPIKeys,
  CoreAPIMethod,
  CoreAPIReturns,
  CoreAPIType,
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
} from "@ove/ove-types";
import { Socket } from "socket.io";
import { state } from "./state";

console.log("Initialising hardware component");

const getSocket: (socketId: string) => Socket<
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
> = (socketId: string) => io.sockets.get(state.clients[socketId]);

const generateProcedure = (k: CoreAPIKeys) => protectedProcedure
  .meta(CoreAPI[k].meta)
  .input<CoreAPIType[typeof k]["args"]>(CoreAPI[k].args)
  .output<CoreAPIType[typeof k]["bridge"]>(CoreAPI[k].bridge);

const generateQuery = (k: CoreAPIKeys) => generateProcedure(k)
  .query<CoreAPIReturns<typeof k>>(async ({
    input: {
      bridgeId,
      ...args
    }
  }) =>
    await new Promise<CoreAPIReturns<typeof k>>(resolve => {
      // @ts-ignore
      getSocket(bridgeId).emit<typeof k>(k, args, resolve);
    }));

const generateMutation = (k: CoreAPIKeys) => generateProcedure(k)
  .mutation<CoreAPIReturns<typeof k>>(async ({
    input: {
      bridgeId,
      ...args
    }
  }) => new Promise<CoreAPIReturns<typeof k>>(resolve => {
    // @ts-ignore
    getSocket(bridgeId).emit<typeof k>(k, args, resolve);
  }));

type Router = {
  [Key in CoreAPIKeys]: CoreAPIMethod<Key> extends "GET" ?
    ReturnType<typeof generateQuery> : ReturnType<typeof generateMutation>
}

const routes = (Object.keys(CoreAPI) as Array<CoreAPIKeys>)
  .reduce((acc, k) => ({
    ...acc,
    [k]: CoreAPI[k].meta.openapi.method === "GET" ?
      generateQuery(k) : generateMutation(k)
  }), {} as Router);

export const hardwareRouter = router(routes);