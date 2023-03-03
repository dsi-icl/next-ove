import {z} from "zod";

export const StatusSchema = z.object({status: z.string()});

export type Status = z.infer<typeof StatusSchema>;

export const OVEExceptionSchema = z.object({bridge: z.string(), oveError: z.string()});

export type OVEException = z.infer<typeof OVEExceptionSchema>;

export const isException = (obj: object): obj is OVEException => "oveError" in obj;
