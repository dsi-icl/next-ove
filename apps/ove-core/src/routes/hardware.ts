import { z } from "zod";
import Service from "../app/hardware/hardware";
import { procedure, router } from "../trpc";
import { logger } from "../app";
import { io as SocketServer } from "../sockets";
import {
  ClientToServerEvents, Device,
  DeviceSchema, InfoSchema, OVEException,
  OVEExceptionSchema, ServerToClientEvents, StatusSchema, WSResponse
} from "@ove/ove-types";
import { Namespace } from "socket.io";

const service = Service();

const DeviceInputSchema = z.object({ bridgeId: z.string(), deviceId: z.string() });
const BridgeInputSchema = z.object({ bridgeId: z.string(), tag: z.string().optional() });

const generateOutputSchema = <Type extends z.ZodTypeAny>(schema: Type) => z.union([z.object({
  bridge: z.string(),
  response: schema
}), OVEExceptionSchema]);

let state = { clients: {} };
logger.info("Initialising Hardware");
const io: Namespace<ClientToServerEvents, ServerToClientEvents> = SocketServer.of("/hardware");

const multiSocketHandling = <RType, Ev extends keyof ServerToClientEvents>(event: Ev, loadArgs: (resolve: (obj: RType) => void) => Parameters<ServerToClientEvents[Ev]>): Promise<RType[]> =>
  Promise.all(Array.from(io.sockets.values()).map((v) =>
    new Promise<RType>((resolve) => {
      v.emit(event, ...loadArgs(resolve));
    })));

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

export const hardwareRouter = router({
  addDevice: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/device/{bridgeId}/{deviceId}" } })
    .input(DeviceSchema.omit({ id: true }).merge(DeviceInputSchema))
    .output(generateOutputSchema(StatusSchema))
    .mutation(async ({ input }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[input.bridgeId]).emit("addDevice", { device: input }, response => resolve(response)))),
  getBrowserStatus: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/{deviceId}/browser/{browserId}/status" } })
    .input(DeviceInputSchema.extend({ browserId: z.number() }))
    .output(generateOutputSchema(StatusSchema))
    .query(async ({ input: { bridgeId, deviceId, browserId } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getBrowserStatus", {
          id: deviceId,
          browserId
        }, response => resolve(response)))),
  getBrowserStatusAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/browsers/status" } })
    .input(BridgeInputSchema.extend({ browserId: z.number() }))
    .output(generateOutputSchema(z.array(StatusSchema)))
    .query(async ({ input: { bridgeId, tag, browserId } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getBrowserStatusAll", {
          tag,
          browserId
        }, response => resolve(response)))),
  getBrowsers: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/{deviceId}/browsers" } })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(z.array(z.number())))
    .query(async ({ input: { bridgeId, deviceId } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getBrowsers", { id: deviceId }, response => resolve(response)))),
  getBrowsersAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/browsers" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(z.array(z.number()))))
    .query(async ({ input: { bridgeId, tag } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getBrowsersAll", { tag }, response => resolve(response)))),
  getDevice: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/device/{deviceId}" } })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(DeviceSchema))
    .query(async ({ input: { bridgeId, deviceId } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getDevice", { id: deviceId }, response => resolve(response)))),
  getDeviceStatus: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/{deviceId}/status" } })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(StatusSchema))
    .query(async ({ input: { bridgeId, deviceId } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getStatus", { id: deviceId }, response => resolve(response)))),
  getDevices: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/devices" } })
    .input(z.void())
    .output(z.array(generateOutputSchema(z.array(DeviceSchema))))
    .query(async () =>
      multiSocketHandling<WSResponse<Device[]> | OVEException, "getDevices">("getDevices", resolve => [{}, response => resolve(response)])),
  getDevicesForBridge: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/devices" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(DeviceSchema)))
    .query(async ({ input: { bridgeId } }) =>
      new Promise(resolve => io.sockets.get(state.clients[bridgeId]).emit("getDevices", {}, response => resolve(response)))),
  getInfo: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/{deviceId}/info" } })
    .input(DeviceInputSchema.extend({ type: z.string().optional() }))
    .output(generateOutputSchema(InfoSchema))
    .query(async ({ input: { bridgeId, deviceId, type } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getInfo", {
          id: deviceId,
          type
        }, response => resolve(response)))),
  getInfoAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/info" } })
    .input(BridgeInputSchema.extend({ type: z.string().optional() }))
    .output(generateOutputSchema(z.array(InfoSchema)))
    .query(async ({ input: { bridgeId, tag, type } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getInfoAll", { tag, type }, response => resolve(response)))),
  getStatusAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/status" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(StatusSchema)))
    .query(async ({ input: { bridgeId } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getStatusAll", { tag: "test" }, (response) => resolve(response)))),
  home: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/" } })
    .input(z.void())
    .output(z.object({ message: z.string() }))
    .query(() => service.getWelcome()),
  reboot: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/{deviceId}/reboot" } })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(z.string()))
    .mutation(async ({ input: { bridgeId, deviceId } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("reboot", { id: deviceId }, response => resolve(response)))),
  rebootAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/reboot" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(z.string())))
    .mutation(async ({ input: { bridgeId, tag } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("rebootAll", { tag }, response => resolve(response)))),
  removeDevice: procedure
    .meta({ openapi: { method: "DELETE", path: "/hardware/device/{bridgeId}/{deviceId}" } })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(StatusSchema))
    .mutation(async ({ input: { bridgeId, deviceId } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("removeDevice", { id: deviceId }, response => resolve(response)))),
  start: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/{deviceId}/start" } })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(z.boolean()))
    .mutation(async ({ input: { bridgeId, deviceId } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("start", { id: deviceId }, response => resolve(response)))),
  startAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/start" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(z.boolean())))
    .mutation(async ({ input: { bridgeId, tag } }) =>
      new Promise(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("startAll", { tag }, response => resolve(response))))
});
