import { mergeRouters, protectedProcedure, router } from "../trpc";
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
import { z } from "zod";
import { PrismaClient } from "@prisma/client";

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

const toBridgeRouter = router(routes);

const coreRouter = router({
  getObservatories: protectedProcedure
    .meta({ openapi: { method: "GET", path: "/bridges", protect: true } })
    .input(z.void())
    .output(z.array(z.object({ name: z.string(), isOnline: z.boolean() })))
    .query(async () => {
      const prisma = new PrismaClient();
      const observatories = await prisma.auth.findMany({
        where: {
          role: "bridge"
        },
        select: {
          username: true
        }
      });
      return observatories.map(({username}) => ({
        name: username,
        isOnline: Object.keys(state.clients).includes(username)
      }));
    })
});

export const hardwareRouter = mergeRouters(toBridgeRouter, coreRouter);