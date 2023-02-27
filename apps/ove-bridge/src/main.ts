import * as dotenv from "dotenv";
import { Logging } from "@ove/ove-utils";
import { environment } from "./environments/environment";
import { io, Socket } from "socket.io-client";
import * as Service from "./app/service";
import { ClientToServerEvents, ServerToClientEvents } from "../../../libs/ove-types/src/lib/hardware";
import { DeviceIDSchema } from "./utils/schemas";

dotenv.config();

console.log(process.env.NAME);

const wrapCallback = (callback: (response: object) => void) => (response: object) => callback({
  bridge: environment.name,
  response
});

const logger = Logging.Logger("bridge", -1);
logger.debug("This is a test");

const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(`ws://${environment.core}/hardware`, { autoConnect: false });
socket.auth = { "name": `${environment.name}` };
socket.connect();
logger.debug(`Testing: ${environment.core}`);

socket.on("connect", () => {
  logger.info("Connected");
  logger.debug(socket.id);
});

socket.on("disconnect", () => {
  logger.info("Disconnected");
  logger.debug(socket.id);
});

socket.on("getDevices", callback => wrapCallback(callback)(Service.getDevices()));

socket.on("info", (callback, id, type) => wrapCallback(callback)(Service.info(DeviceIDSchema.parse(id), type)));

socket.on("connect_error", err => logger.error(`connect_error due to ${err.message}`));
