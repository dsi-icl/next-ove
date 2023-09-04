import { mergeRouters, protectedProcedure, router } from "../trpc";
import { io } from "./sockets";
import {
  CoreAPI,
  type TCoreAPI,
  type CoreRouter,
  type TCoreAPIOutput,
  type THardwareClientToServerEvents,
  type THardwareServerToClientEvents
} from "@ove/ove-types";
import { type Socket } from "socket.io";
import { state } from "../state";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { assert } from "@ove/ove-utils";

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
  .query<TCoreAPIOutput<typeof k>>(async ({
    input: {
      bridgeId,
      ...args
    }
  }) =>
    await new Promise<TCoreAPIOutput<typeof k>>(resolve => {
      // @ts-ignore
      getSocket(bridgeId).emit<typeof k>(k, args, resolve);
    }));

// unknown need for a generic non-generic function
// @ts-ignore
const generateMutation = <Key extends keyof TCoreAPI>(k: keyof TCoreAPI) => generateProcedure(k)
  .mutation<TCoreAPIOutput<typeof k>>(async ({
    input: {
      bridgeId,
      ...args
    }
  }) => new Promise<TCoreAPIOutput<typeof k>>(resolve => {
    // @ts-ignore
    getSocket(bridgeId).emit<typeof k>(k, args, resolve);
  }));

export type TGenerateQuery<Key extends keyof TCoreAPI> = typeof generateQuery<Key>
export type TGenerateMutation<Key extends keyof TCoreAPI> = typeof generateMutation<Key>

const routes: CoreRouter = Object.entries(CoreAPI).reduce((acc, [k, route]) => {
  acc[k] = route.meta.openapi.method === "GET"
    ? generateQuery(k as keyof typeof CoreAPI)
    : generateMutation(k as keyof typeof CoreAPI);
  return acc;
}, <{[key: string]: unknown}>{}) as CoreRouter;

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
      return observatories.map(({ username }) => ({
        name: username,
        isOnline: Object.keys(state.bridgeClients).includes(username)
      }));
    })
});

export const hardwareRouter = mergeRouters(toBridgeRouter, coreRouter);