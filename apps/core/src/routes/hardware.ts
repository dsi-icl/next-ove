import { z } from "zod";
import Service from "../app/hardware/hardware";
import { procedure, router } from "../trpc";
import { logger } from "../app";
import { io as SocketServer } from "../sockets";
import { DeviceSchema } from "../../../../libs/ove-types/src/lib/hardware";

const service = Service();

let state = {clients: {}};
logger.info('Initialising Hardware');
const io = SocketServer.of("/hardware");

io.on("connection", socket => {
  logger.info(`${socket.id} connected via /hardware`);
  logger.debug(`Socket ID: ${socket.handshake.auth.name}`);
  state.clients = {...state.clients, [socket.handshake.auth.name]: socket.id};
  logger.debug(JSON.stringify(state.clients));

  socket.on("disconnect", reason => {
    delete state.clients[socket.handshake.auth.name];
    logger.debug(JSON.stringify(state.clients));
    logger.info(`${socket.id} disconnected with reason: ${reason}`);
  });
});

export const hardwareRouter = router({
  home: procedure
    .meta({openapi: {method: "GET", path: "/hardware/"}})
    .input(z.undefined())
    .output(z.object({message: z.string()}))
    .query(() => {
      return service.getWelcome();
    }),
  getDevicesForBridge: procedure
    .meta({openapi: {method: "GET", path: "/hardware/devices/{bridge}"}})
    .input(z.object({bridge: z.string()}))
    .output(z.array(z.string()))
    .query(async ({input: { bridge }}) =>
      new Promise((resolve, reject) => {
        state.clients[bridge].emit("getDevices", (err, response) => {
          if (err) {
            reject(err);
          }
          resolve(response);
        });
      })),
  getDevices: procedure
    .meta({openapi: {method: "GET", path: "/hardware/devices"}})
    .input(z.void())
    .output(z.array(z.object({bridge: z.string(), response: z.array(DeviceSchema)})))
    .query(async () => new Promise((resolve) => {
      io.timeout(5000).emit("getDevices", (_, response) => {
        console.log(JSON.stringify(response))
        console.log(z.array(z.object({bridge: z.string(), response: z.array(DeviceSchema)})).parse(response))
        resolve(response);
      })
    }))
});
