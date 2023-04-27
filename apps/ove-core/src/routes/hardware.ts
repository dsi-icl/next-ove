import { procedure, router } from "../trpc";
import { logger } from "../app";
import { io as SocketServer } from "../sockets";
import {
  HardwareServerToClientEvents,
  HardwareClientToServerEvents,
  CoreAPI,
  CoreAPIKeys,
  CoreAPIMethod, CoreAPIType, CoreAPIReturns
} from "@ove/ove-types";
import { Namespace, Socket } from "socket.io";

const getSocket: (socketId: string) => Socket<HardwareClientToServerEvents, HardwareServerToClientEvents> =
  (socketId: string) => io.sockets.get(state.clients[socketId]);

const state = { clients: {} };
logger.info("Initialising Hardware");
const io: Namespace<HardwareClientToServerEvents, HardwareServerToClientEvents> =
  SocketServer.of("/hardware");

io.on("connection", socket => {
  logger.info(`${socket.id} connected via /hardware`);
  logger.debug(`Socket ID: ${socket.handshake.auth.name}`);
  state.clients = { ...state.clients, [socket.handshake.auth.name]: socket.id };
  logger.debug(JSON.stringify(state.clients));

  socket.on("disconnect", reason => {
    delete state.clients[socket.handshake.auth.name];
    logger.debug(JSON.stringify(state.clients));
    logger.info(`${socket.id} disconnected with reason: ${reason}`);
  });
});

const generateProcedure = (k: CoreAPIKeys) => procedure
  .meta(CoreAPI[k].meta)
  .input<CoreAPIType[typeof k]["args"]>(CoreAPI[k].args)
  .output<CoreAPIType[typeof k]["bridge"]>(CoreAPI[k].bridge)

const generateQuery = (k: CoreAPIKeys) => generateProcedure(k)
  .query<CoreAPIReturns<typeof k>>(({input: {bridgeId, ...args}}) => new Promise(resolve => getSocket(bridgeId).emit(k, args, resolve)));

const generateMutation = (k: CoreAPIKeys) => generateProcedure(k)
  .mutation<CoreAPIReturns<typeof k>>(({input: {bridgeId, ...args}}) => new Promise(resolve => getSocket(bridgeId).emit(k, args, resolve)));

type Router = {
  [Key in CoreAPIKeys]: CoreAPIMethod<Key> extends "GET" ? ReturnType<typeof generateQuery> : ReturnType<typeof generateMutation>
}

const routes = (Object.keys(CoreAPI) as Array<CoreAPIKeys>).reduce((acc, k) => ({
  ...acc,
  [k]: CoreAPI[k].meta.openapi.method === "GET" ? generateQuery(k) : generateMutation(k)
}), {} as Router);

export const hardwareRouter = router(routes);
