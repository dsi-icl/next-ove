/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import {Logging} from "@ove/ove-utils";
import { environment } from "./environments/environment";
import { io } from "socket.io-client";
import * as controller from "./app/controller";

const logger = Logging.Logger("bridge", -1);
logger.debug("This is a test");
const wrapCallback = f => data => f({ "bridge-id": environment.name, "data": data });

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

socket.on("message", (url, type, callback) => {
  callback = wrapCallback(callback);
  if (!url) {
    callback("Matched /");
  }

  let match;
  logger.debug(url);

  switch (url) {
    case url.match(/^\/devices$/i)?.input:
      callback(controller.devices());
      return;
    case (match = url.match(/^\/devices\/(.+)$/i))?.input: {
      callback(controller.devices(match[1]));
      return;
    }
    case (match = url.match(/^\/device\/([0-9]+)$/i))?.input:
      callback(controller.device(match[1]));
      return;
    default:
      throw Error(`Unknown URL: ${url}`);
  }
});

socket.on('connect_error', err => logger.error(`connect_error due to ${err.message}`));
