/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */
import * as dotenv from "dotenv";
import {Logging} from "@ove/ove-utils";
import { environment } from "./environments/environment";
import { io } from "socket.io-client";
import * as Controller from "./app/controller";
import { DeleteSchema, GetSchema, PostSchema, wrapCallback } from "./utils/utils";

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

socket.on("get", (data_, callback) => {
  const data = GetSchema.parse(data_);

  switch (data.type) {
    case "devices":
      Controller.getDevices(data, wrapCallback(callback));
      break;
    case "device":
      Controller.getDevice(data, wrapCallback(callback));
      break;
  }
});
socket.on("post", (data_, callback) => {
  const data = PostSchema.parse(data_);

  switch (data.type) {
    case "device":
      Controller.addDevice(data, wrapCallback(callback));
      break;
    case "reboot":
      Controller.reboot(data, wrapCallback(callback));
      break;
    case "shutdown":
      Controller.shutdown(data, wrapCallback(callback));
      break;
    case "start":
      Controller.start(data, wrapCallback(callback));
      break;
  }
});
socket.on("delete", (data_, callback) => {
  const data = DeleteSchema.parse(data_);

  switch (data.type) {
    case "device":
      Controller.removeDevice(data, wrapCallback(callback));
      break;
  }
});

socket.on('connect_error', err => logger.error(`connect_error due to ${err.message}`));
