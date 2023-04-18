/* global __dirname */

import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { Device, DeviceSchema } from "@ove/ove-types";

export const readAsset = (filename: string) => JSON.parse(fs.readFileSync(
  path.join(__dirname, "assets", filename)).toString());
export const toAsset = (
  filename: string,
  obj: unknown,
  overwrite = true
) => safeWriteFile(
  path.join(__dirname, "assets", filename),
  JSON.stringify(obj, null, 2),
  overwrite
);

const safeWriteFile = (path: string, data: string, overwrite: boolean) => {
  if (overwrite) {
    fs.writeFileSync(path, data);
    return true;
  } else {
    try {
      fs.statSync(path);
      return false;
    } catch (e) {
      fs.writeFileSync(path, data);
      return true;
    }
  }
};

export const envPath = path.join(__dirname, ".env");

export const writeEnv = (env: object, overwrite = true) => {
  safeWriteFile(envPath, Object.keys(env)
    .map(k => `${k}=${JSON.stringify(env[k as keyof typeof env])}`)
    .join("\n"), overwrite);
};

export const safeFileDelete = (path: string) => {
  try {
    fs.statSync(path);
    fs.unlinkSync(path);
    return true;
  } catch (e) {
    return false;
  }
};

export const getDevices = () =>
  z.array(DeviceSchema).parse(readAsset("hardware.json"));

export const saveDevices = (devices: Device[]) =>
  toAsset("hardware.json", devices);
