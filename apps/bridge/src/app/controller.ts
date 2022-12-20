import * as service from "./service";
import { DeleteData, DeviceID, GetData, PostData, ResponseCallback } from "../utils/types";
import * as Utils from "../utils/utils";


export const getDevices = (data: GetData, callback: ResponseCallback) => callback(service.getDevices(data.tag));

export const getDevice = ({ id }: GetData, callback: ResponseCallback) => {
  if (id === undefined) {
    callback({ error: "No device specified" });
    return;
  }
  callback(service.getDevice(id));
};

export const addDevice = ({ device }: PostData, callback: ResponseCallback) => {
  if (device === undefined) {
    callback({ error: "No device provided" });
    return;
  } else if (device.id in Utils.getIds()) {
    callback({ error: "Device already exists" });
    return;
  }
  callback(service.addDevice(device));
};

export const reboot = (id: DeviceID, callback: ResponseCallback) => {
  callback(service.reboot(id));
};

export const shutdown = (id: DeviceID, callback: ResponseCallback) => {
  callback(service.shutdown(id));
};

export const start = (id: DeviceID, callback: ResponseCallback) => {
  callback(service.start(id));
};

export const info = (data: GetData, callback: ResponseCallback) => {
  callback(service.info(data.query, data));
};

export const status = (id: DeviceID, callback: ResponseCallback) => {
  callback(service.status(id));
};

export const execute = (data: PostData, callback: ResponseCallback) => {
  callback(service.execute(data.command, data));
};

export const screenshot = (data: PostData, callback: ResponseCallback) => {
  callback(service.screenshot(data.method, data.format, data.screens, data));
};

export const openBrowser = (id: DeviceID, callback: ResponseCallback) => {
  callback(service.openBrowser(id));
};

export const getBrowserStatus = (id: DeviceID, callback: ResponseCallback) => {
  callback(service.getBrowserStatus(id));
};

export const closeBrowser = (id: DeviceID, callback: ResponseCallback) => {
  callback(service.closeBrowser(id));
};

export const removeDevice = ({id}: DeleteData, callback) => {
  callback(service.removeDevice(id));
};
