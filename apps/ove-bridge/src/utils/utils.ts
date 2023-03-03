import { Logging } from "@ove/ove-utils";
import * as fs from "fs";
import * as path from "path";
import {z} from "zod";
import { Device, DeviceSchema } from "@ove/ove-types";

export const logger = Logging.Logger("bridge");

const readAsset = (filename: string) => JSON.parse(fs.readFileSync(path.join(__dirname, "assets", filename)).toString());
const toAsset = (obj: any, filename: string) => fs.writeFileSync(path.join(__dirname, "assets", filename), JSON.stringify(obj));

export const getDevices = () => z.array(DeviceSchema).parse(readAsset("hardware.json"));

export const saveDevices = (devices: Device[]) => toAsset(devices, "hardware.json");

export const getTags = (): string[] => getDevices().flatMap(({ tags }) => tags);

export const getIds = (): string[] => getDevices().flatMap(({ id }) => id);

export const generateTagRegex = (): RegExp => new RegExp(`^${getTags().join("|")}$`, "gi");

export const generateIdRegex = (): RegExp => new RegExp(`^${getIds().join("|")}$`, "gi");

// noinspection JSUnusedGlobalSymbols
export const notEmpty = <TValue>(value: TValue | null | undefined): value is TValue => {
  if (value === null || value === undefined) return false;
  // noinspection JSUnusedLocalSymbols
  const dummy: TValue = value;
  return true;
};
