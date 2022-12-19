import * as service from "./service";
import { DeleteData, DeviceID, GetData, PostData } from "../utils/types";
import * as Utils from "../utils/utils";


export const getDevices = (data: GetData, callback) => callback(service.getDevices(data.tag));

export const getDevice = ({ id }: GetData, callback) => {
  if (id === undefined) {
    callback({ error: "No device specified" });
    return;
  }
  callback(service.getDevice(id));
};

export const addDevice = ({ device }: PostData, callback) => {
  if (device === undefined) {
    callback({ error: "No device provided" });
    return;
  } else if (device.id in Utils.getIds()) {
    callback({ error: "Device already exists" });
    return;
  }
  callback(service.addDevice(device));
};

export const reboot = (id: DeviceID, callback) => {
  callback(service.reboot(id));
};

export const shutdown = (id: DeviceID, callback) => {
  callback(service.shutdown(id));
};

export const start = (id: DeviceID, callback) => {
  callback(service.start(id));
};

export const removeDevice = ({id}: DeleteData, callback) => {
  callback(service.removeDevice(id));
};
