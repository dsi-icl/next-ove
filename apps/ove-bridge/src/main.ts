import * as dotenv from "dotenv";
import { environment } from "./environments/environment";
import { io, Socket } from "socket.io-client";
import * as Service from "./app/service";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  WSResponse
} from "@ove/ove-types";
import { Utils, Logging } from "@ove/ove-utils";

const wrapCallback = <T>(callback: (response: WSResponse<T>) => void): (response: T) => void => (response: T) => callback({
  response,
  meta: {
    bridge: environment.name
  }
});

dotenv.config();

const logger = Logging.Logger("bridge", -1);

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

socket.on("getDevice", async ({ id }, cb) => {
  const callback = wrapCallback(cb);
  const response = Service.getDevice(id);

  if (response !== undefined) {
    callback(response);
  } else {
    callback(Utils.raise(`No device found with ID: ${id}`));
  }
});

socket.on("getDevices", async (args, cb) => {
  const callback = wrapCallback(cb);
  callback(Service.getDevices());
});

socket.on("getStatusAll", async ({ tag }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.getStatusAll(tag));
});

socket.on("getStatus", async ({ id }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.getStatus(id));
});

socket.on("getInfo", async ({ id, type }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.getInfo(id, type));
});

socket.on("getInfoAll", async ({ tag, type }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.getInfoAll(tag, type));
});

socket.on("getBrowserStatus", async ({ id, browserId }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.getBrowserStatus(id, browserId));
});

socket.on("getBrowserStatusAll", async ({ tag, browserId }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.getBrowserStatusAll(browserId, tag));
});

socket.on("getBrowsers", async ({ id }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.getBrowsers(id));
});

socket.on("getBrowsersAll", async ({ tag }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.getBrowsersAll(tag));
});

socket.on("start", async ({ id }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.start(id));
});

socket.on("startAll", async ({ tag }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.startAll(tag));
});

socket.on("reboot", async ({ id }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.reboot(id));
});

socket.on("rebootAll", async ({ tag }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.rebootAll(tag));
});

socket.on("shutdown", async ({ id }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.shutdown(id));
});

socket.on("shutdownAll", async ({ tag }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.shutdownAll(tag));
});

socket.on("execute", async ({ id, command }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.execute(id, command));
});

socket.on("executeAll", async ({ tag, command }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.executeAll(command, tag));
});

socket.on("screenshot", async ({ id, method, screens }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.screenshot(id, method, screens));
});

socket.on("screenshotAll", async ({
  tag,
  method,
  screens
}, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.screenshotAll(method, screens, tag));
});

socket.on("openBrowser", async ({ id, displayId }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.openBrowser(id, displayId));
});

socket.on("openBrowserAll", async ({ tag, displayId }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.openBrowserAll(displayId, tag));
});

socket.on("addDevice", async ({ device }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.addDevice(device));
});

socket.on("closeBrowser", async ({ id, browserId }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.closeBrowser(id, browserId));
});

socket.on("closeBrowserAll", async ({ tag, browserId }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.closeBrowserAll(browserId, tag));
});

socket.on("closeBrowsers", async ({ id }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.closeBrowsers(id));
});

socket.on("closeBrowsersAll", async ({ tag }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.closeBrowsersAll(tag));
});

socket.on("removeDevice", async ({ id }, cb) => {
  const callback = wrapCallback(cb);
  callback(await Service.removeDevice(id));
});

socket.on("connect_error", err => logger.error(`connect_error due to ${err.message}`));
