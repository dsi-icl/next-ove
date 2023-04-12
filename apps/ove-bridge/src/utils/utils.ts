/* global __dirname */

import { Logging } from "@ove/ove-utils";
import * as fs from "fs";
import * as path from "path";
import { z } from "zod";
import { Device, DeviceSchema } from "@ove/ove-types";

export const logger = Logging.logger("bridge");

const readAsset = (filename: string) => JSON.parse(fs.readFileSync(
  path.join(__dirname, "assets", filename)).toString());
const toAsset = (obj: unknown, filename: string) => fs.writeFileSync(
  path.join(__dirname, "assets", filename),
  JSON.stringify(obj)
);

export const getDevices = () =>
  z.array(DeviceSchema).parse(readAsset("hardware.json"));

export const saveDevices = (devices: Device[]) =>
  toAsset(devices, "hardware.json");
