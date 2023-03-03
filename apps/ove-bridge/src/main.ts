import * as dotenv from "dotenv";
import { Logging } from "@ove/ove-utils";
import { environment } from "./environments/environment";
import { io, Socket } from "socket.io-client";
import * as Service from "./app/service";
import { ClientToServerEvents, ServerToClientEvents } from "@ove/ove-types";

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

socket.on("getDevice", async ({id}, callback) => {
  const response = Service.getDevice(id);
  if (response !== undefined) {
    callback({
      bridge: environment.name,
      response
    });
  } else {
    callback({bridge: environment.name, oveError: `No device found with ID: ${id}`});
  }
});

socket.on("getDevices", async (args, callback) => {
  const response = Service.getDevices();
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("getStatusAll", async ({ tag }, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.getStatusAll(devices);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("getStatus", async ({id}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.getStatus(device);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("getInfo", async ({ id, type }, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.getInfo(device, type);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("getInfoAll", async ({ tag, type }, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.getInfoAll(devices, type);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("getBrowserStatus", async ({id, browserId}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.getBrowserStatus(device, browserId);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("getBrowserStatusAll", async ({tag, browserId}, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.getBrowserStatusAll(devices, browserId);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("getBrowsers", async ({id}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.getBrowsers(device);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("getBrowsersAll", async ({tag}, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.getBrowsersAll(devices);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("start", async ({id}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.start(device);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("startAll", async ({tag}, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.startAll(devices);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("reboot", async ({id}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.reboot(device);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("rebootAll", async ({tag}, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.rebootAll(devices);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("shutdown", async ({id}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.shutdown(device);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("shutdownAll", async ({tag}, callback) => {
  const response = await Service.shutdownAll(tag);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("execute", async ({id, command}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.execute(device, command);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("executeAll", async ({tag, command}, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.executeAll(devices, command);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("screenshot", async ({id, method, format, screens}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.screenshot(device, method, format, screens);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("screenshotAll", async ({tag, method, format, screens}, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.screenshotAll(devices, method, format, screens);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("openBrowser", async ({id, displayId}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.openBrowser(device, displayId);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("openBrowserAll", async ({tag, displayId}, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.openBrowserAll(devices, displayId);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("addDevice", async ({device}, callback) => {
  const response = Service.addDevice(device);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("closeBrowser", async ({id, browserId}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.closeBrowser(device, browserId);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("closeBrowserAll", async ({tag, browserId}, callback) => {
  const devices = Service.getDevices();
  if (devices.length === 0) {
    const tagStatus = tag !== undefined ? ` with tag: ${tag}` : "";
    callback({
      bridge: environment.name,
      oveError: `No devices found${tagStatus}`
    });
    return;
  }
  const response = await Service.closeBrowserAll(devices, browserId);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("closeBrowsers", async ({id}, callback) => {
  const device = Service.getDevice(id);
  if (device === undefined) {
    callback({
      bridge: environment.name,
      oveError: `No device found with ID: ${id}`
    });
    return;
  }
  const response = await Service.closeBrowsers(device);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("closeBrowsersAll", async ({tag}, callback) => {
  const response = await Service.closeBrowsersAll(tag);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("removeDevice", async ({id}, callback) => {
  const response = Service.removeDevice(id);
  callback({
    bridge: environment.name,
    response
  });
});

socket.on("connect_error", err => logger.error(`connect_error due to ${err.message}`));
