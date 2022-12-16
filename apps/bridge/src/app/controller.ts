import { environment } from "../environments/environment";
import { logger } from "../utils/utils";
import * as service from "./service";

const wrapCallback = f => data => f({ "bridge-id": environment.name, "data": data });


const get = async (data, callback) => {
  callback = wrapCallback(callback);

  const { type } = data;
  logger.debug(type);

  switch (type) {
    case "devices":
      callback(service.getDevices(data.tag));
      break;
    case "device":
      callback(service.getDevice(data.id));
      break;
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
};

const post = async (data, callback) => {
  callback = wrapCallback(callback);

  const { type } = data;
  logger.debug(type);

  switch (type) {
    case "device":
      callback(service.addDevice(data.id));
      break;
    case "reboot":
      callback(await service.reboot(data));
      break;
    case "shutdown":
      callback(await service.shutdown(data));
      break;
    case "start":
      callback(await service.start(data));
      break;
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
};

const delete_ = async (data, callback) => {
  callback = wrapCallback(callback);

  const { type } = data;
  logger.debug(type);

  switch (type) {
    case "device":
      callback(service.removeDevice(data.id));
      break;
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
};

const Controller = {
  get,
  post,
  delete: delete_
};

export default Controller;
