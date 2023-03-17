import { z } from "zod";
import { procedure, router } from "../trpc";
import { logger } from "../app";
import { io as SocketServer } from "../sockets";
import {
  BridgeMetadataSchema,
  ClientToServerEvents,
  Device,
  DeviceSchema,
  OVEException,
  OVEExceptionSchema,
  ServerToClientEvents,
  ResponseSchema,
  WSResponse,
  InfoSchema, Response, ID, Info, Status, SourceSchemas
} from "@ove/ove-types";
import { Namespace } from "socket.io";

const DeviceInputSchema = z.object({
  bridgeId: z.string(),
  deviceId: z.string()
});

const BridgeInputSchema = z.object({
  bridgeId: z.string(),
  tag: z.string().optional()
});

const generateOutputSchema = <Type extends z.ZodTypeAny>(schema: Type) => z.object({
  meta: BridgeMetadataSchema,
  response: z.union([schema, OVEExceptionSchema])
});

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
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/device/{bridgeId}/{deviceId}"
      }
    })
    .input(DeviceSchema.omit({ id: true }).merge(DeviceInputSchema))
    .output(generateOutputSchema(z.boolean()))
    .mutation(async ({ input }) => {
      return new Promise<WSResponse<boolean | OVEException>>(resolve => {
        io.sockets.get(state.clients[input.bridgeId]).emit("addDevice", { device: input }, response => resolve(response));
      });
    }),
  getBrowserStatus: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/{deviceId}/browser/{browserId}/status"
      }
    })
    .input(DeviceInputSchema.extend({ browserId: z.number() }))
    .output(generateOutputSchema(ResponseSchema))
    .query(async ({ input: { bridgeId, deviceId, browserId } }) =>
      new Promise<WSResponse<Response | OVEException>>(resolve =>
        io.sockets.get(state.clients[bridgeId]).emit("getBrowserStatus", {
          id: deviceId,
          browserId
        }, response => resolve(response)))),
  getBrowserStatusAll: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/browsers/status"
      }
    })
    .input(BridgeInputSchema.extend({ browserId: z.number() }))
    .output(generateOutputSchema(z.array(z.union([ResponseSchema, OVEExceptionSchema]))))
    .query(async ({ input: { bridgeId, tag, browserId } }) => {
      return new Promise<WSResponse<(Response | OVEException)[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("getBrowserStatusAll", {
          tag,
          browserId
        }, response => resolve(response));
      });
    }),
  getBrowsers: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/{deviceId}/browsers"
      }
    })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(z.array(z.number())))
    .query(async ({ input: { bridgeId, deviceId } }) => {
      return new Promise<WSResponse<ID[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("getBrowsers", { id: deviceId }, response => resolve(response));
      });
    }),
  getBrowsersAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/browsers" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(z.union([z.array(z.number()), OVEExceptionSchema]))))
    .query(async ({ input: { bridgeId, tag } }) => {
      return new Promise<WSResponse<(ID[] | OVEException)[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("getBrowsersAll", { tag }, response => resolve(response));
      });
    }),
  getDevice: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/device/{deviceId}"
      }
    })
    .input(DeviceInputSchema)
    .output(DeviceSchema)
    .query(async ({ input: { bridgeId, deviceId } }) => {
      return new Promise<WSResponse<Device | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("getDevice", { id: deviceId }, (response) => resolve(response));
      });
    }),
  getDeviceStatus: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/{deviceId}/status"
      }
    })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(ResponseSchema))
    .query(async ({ input: { bridgeId, deviceId } }) => {
      return new Promise<WSResponse<Response | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("getStatus", { id: deviceId }, response => resolve(response));
      });
    }),
  getDevices: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/devices" } })
    .input(z.void())
    .output(z.array(generateOutputSchema(z.array(DeviceSchema))))
    .query(async () => {
      return multiSocketHandling<WSResponse<Device[] | OVEException>, "getDevices">("getDevices", resolve => [{}, response => resolve(response)]);
    }),
  getDevicesForBridge: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/devices" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(DeviceSchema)))
    .query(async ({ input: { bridgeId } }) => {
      return new Promise<WSResponse<Device[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("getDevices", {}, response => resolve(response));
      });
    }),
  getInfo: procedure
    .meta({
      openapi: {
        method: "GET",
        path: "/hardware/{bridgeId}/{deviceId}/info"
      }
    })
    .input(DeviceInputSchema.extend({ type: z.string().optional() }))
    .output(generateOutputSchema(InfoSchema))
    .query(async ({ input: { bridgeId, deviceId, type } }) => {
      return new Promise(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("getInfo", {
          id: deviceId,
          type
        }, response => resolve(response));
      });
    }),
  getInfoAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/info" } })
    .input(BridgeInputSchema.extend({ type: z.string().optional() }))
    .output(generateOutputSchema(z.array(z.union([InfoSchema, OVEExceptionSchema]))))
    .query(async ({ input: { bridgeId, tag, type } }) => {
      return new Promise<WSResponse<(Info | OVEException)[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("getInfoAll", {
          tag,
          type
        }, response => resolve(response));
      });
    }),
  getStatusAll: procedure
    .meta({ openapi: { method: "GET", path: "/hardware/{bridgeId}/status" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(z.union([ResponseSchema, OVEExceptionSchema]))))
    .query(async ({ input: { bridgeId } }) => {
      return new Promise<WSResponse<(Response | OVEException)[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("getStatusAll", { tag: "test" }, (response) => resolve(response));
      });
    }),
  reboot: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/reboot"
      }
    })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(z.boolean()))
    .mutation(async ({ input: { bridgeId, deviceId } }) => {
      return new Promise<WSResponse<Status | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("reboot", { id: deviceId }, response => resolve(response));
      });
    }),
  rebootAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/reboot" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(z.union([z.boolean(), OVEExceptionSchema]))))
    .mutation(async ({ input: { bridgeId, tag } }) => {
      return new Promise<WSResponse<(Status | OVEException)[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("rebootAll", { tag }, response => resolve(response));
      });
    }),
  shutdown: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/shutdown"
      }
    })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(z.boolean()))
    .mutation(async ({ input: { bridgeId, deviceId } }) => {
      return new Promise<WSResponse<Status | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("shutdown", { id: deviceId }, response => resolve(response));
      });
    }),
  shutdownAll: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/shutdown"
      }
    })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(z.union([z.boolean(), OVEExceptionSchema]))))
    .mutation(async ({ input: { bridgeId, tag } }) => {
      return new Promise<WSResponse<(Status | OVEException)[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("shutdownAll", { tag }, response => resolve(response));
      });
    }),
  removeDevice: procedure
    .meta({
      openapi: {
        method: "DELETE",
        path: "/hardware/device/{bridgeId}/{deviceId}"
      }
    })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(z.boolean()))
    .mutation(async ({ input: { bridgeId, deviceId } }) => {
      return new Promise<WSResponse<Status | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("removeDevice", { id: deviceId }, response => resolve(response));
      });
    }),
  start: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/start"
      }
    })
    .input(DeviceInputSchema)
    .output(generateOutputSchema(z.boolean()))
    .mutation(async ({ input: { bridgeId, deviceId } }) => {
      return new Promise<WSResponse<Status | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("start", { id: deviceId }, response => resolve(response));
      });
    }),
  startAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/start" } })
    .input(BridgeInputSchema)
    .output(generateOutputSchema(z.array(z.union([z.boolean(), OVEExceptionSchema]))))
    .mutation(async ({ input: { bridgeId, tag } }) => {
      return new Promise<WSResponse<(Status | OVEException)[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("startAll", { tag }, response => resolve(response));
      });
    }),
  setVolume: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/volume"
      }
    })
    .input(DeviceInputSchema.extend({ volume: z.number() }))
    .output(generateOutputSchema(z.boolean()))
    .mutation(async ({ input: { bridgeId, deviceId, volume } }) => {
      return new Promise<WSResponse<Status | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("setVolume", {
          id: deviceId,
          volume
        }, response => resolve(response));
      });
    }),
  setVolumeAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/volume" } })
    .input(BridgeInputSchema.extend({ volume: z.number() }))
    .output(generateOutputSchema(z.array(z.union([z.boolean(), OVEExceptionSchema]))))
    .mutation(async ({ input: { bridgeId, volume, tag } }) => {
      return new Promise<WSResponse<(Status | OVEException)[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("setVolumeAll", {
          volume,
          tag
        }, response => resolve(response));
      });
    }),
  setSource: procedure
    .meta({
      openapi: {
        method: "POST",
        path: "/hardware/{bridgeId}/{deviceId}/source"
      }
    })
    .input(DeviceInputSchema.extend({
      source: SourceSchemas,
      channel: z.number().optional()
    }))
    .output(generateOutputSchema(z.boolean()))
    .mutation(async ({ input: { bridgeId, deviceId, source, channel } }) => {
      return new Promise<WSResponse<Status | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("setSource", {
          id: deviceId,
          source,
          channel
        }, response => resolve(response));
      });
    }),
  setSourceAll: procedure
    .meta({ openapi: { method: "POST", path: "/hardware/{bridgeId}/source" } })
    .input(BridgeInputSchema.extend({
      source: SourceSchemas,
      channel: z.number().optional()
    }))
    .output(generateOutputSchema(z.array(z.union([z.boolean(), OVEExceptionSchema]))))
    .mutation(async ({ input: { bridgeId, tag, source, channel } }) => {
      return new Promise<WSResponse<(Status | OVEException)[] | OVEException>>(resolve => {
        io.sockets.get(state.clients[bridgeId]).emit("setSourceAll", {
          tag,
          source,
          channel
        }, response => resolve(response));
      });
    })
});