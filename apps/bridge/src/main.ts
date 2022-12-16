/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import * as dotenv from "dotenv";
import {Logging} from "@ove/ove-utils";
import { environment } from "./environments/environment";
import { io } from "socket.io-client";
import Controller from "./app/controller";

dotenv.config();

const logger = Logging.Logger("bridge", -1);
logger.debug("This is a test");

const socket = io(`ws://${environment.core}/hardware`, {autoConnect: false});
socket.auth = {"name": `${environment.name}`};
socket.connect();
logger.debug(`Testing: ${environment.core}`);

socket.on('connect', () => {
  logger.info('Connected');
  logger.debug(socket.id);
});

socket.on('disconnect', () => {
  logger.info('Disconnected');
  logger.debug(socket.id);
});

socket.on("get", (data, callback) => Controller.get(data, callback));
socket.on("post", (data, callback) => Controller.post(data, callback));
socket.on("delete", (data, callback) => Controller.delete(data, callback));

socket.on('connect_error', err => logger.error(`connect_error due to ${err.message}`));
