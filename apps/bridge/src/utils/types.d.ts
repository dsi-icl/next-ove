import {z} from "zod";
import { DeviceIDSchema, DeviceSchema, GetSchema, PostSchema } from "./utils";

export type Device = z.infer<typeof DeviceSchema>;

export type GetData = z.infer<typeof GetSchema>;

export type PostData = z.infer<typeof PostSchema>;

export type DeviceID = z.infer<typeof DeviceIDSchema>;

export type DeleteData = z.infer<typeof DeleteSchema>;
