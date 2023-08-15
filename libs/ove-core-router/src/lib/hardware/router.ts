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
import { state } from "../state";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { mapObject } from "@ove/ove-utils";

const getSocket: (socketId: string) => Socket<
  HardwareClientToServerEvents,
  HardwareServerToClientEvents
> = (socketId: string) => io.sockets.get(state.hardwareClients.get(socketId));

const generateProcedure = <Key extends CoreAPIKeys>(k: Key) => protectedProcedure
  .meta(CoreAPI[k].meta)
  .input<CoreAPIType[Key]["args"]>(CoreAPI[k].args)
  .output<CoreAPIType[Key]["bridge"]>(CoreAPI[k].bridge);

const generateQuery = <Key extends CoreAPIKeys>(k: Key) => generateProcedure(k)
  .query<CoreAPIReturns<Key>>(async ({
    input: {
      bridgeId,
      ...args
    }
  }) =>
    await new Promise<CoreAPIReturns<Key>>(resolve => {
      // @ts-ignore
      getSocket(bridgeId).emit<Key>(k, args, resolve);
    }));

const generateMutation = <Key extends CoreAPIKeys>(k: Key) => generateProcedure(k)
  .mutation<CoreAPIReturns<Key>>(async ({
    input: {
      bridgeId,
      ...args
    }
  }) => new Promise<CoreAPIReturns<Key>>(resolve => {
    // @ts-ignore
    getSocket(bridgeId).emit<Key>(k, args, resolve);
  }));

type Router = {
  [Key in CoreAPIKeys]: CoreAPIMethod<Key> extends "GET" ?
    ReturnType<typeof generateQuery<Key>> : ReturnType<typeof generateMutation<Key>>
}

const routes: Router = mapObject(CoreAPI, (k, v, m) => {
  m[k] = v.meta.openapi.method === "GET" ? generateQuery(k) : generateMutation(k)
});

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
        isOnline: Object.keys(state.bridgeClients).includes(username)
      }));
    })
});

export const hardwareRouter = mergeRouters(toBridgeRouter, coreRouter);