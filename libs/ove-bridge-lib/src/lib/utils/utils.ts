/* global __dirname */

import { z } from "zod";
import { Device, DeviceSchema } from "@ove/ove-types";
import { readAsset, toAsset } from "@ove/file-utils";

export const getDevices = () =>
  z.array(DeviceSchema).parse(readAsset("hardware.json"));

export const saveDevices = (devices: Device[]) =>
  toAsset("hardware.json", devices);
