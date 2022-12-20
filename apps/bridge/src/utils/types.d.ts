import {z} from "zod";
import { DeleteSchema, DeviceIDSchema, DeviceSchema, GetSchema, PostSchema } from "./utils";

export type Device = z.infer<typeof DeviceSchema>;

export type GetData = z.infer<typeof GetSchema>;

export type PostData = z.infer<typeof PostSchema>;

export type DeviceID = z.infer<typeof DeviceIDSchema>;

export type DeleteData = z.infer<typeof DeleteSchema>;

export type DeviceService = {
  reboot: (ip: string, port: number) => Promise<object | boolean>
  shutdown: (ip: string, port: number) => Promise<object | boolean>
  start: (ip: string, port: number, mac: string) => Promise<object | boolean>
};

export type DeviceResult = object | boolean
