import { z } from "zod";
import {
  ServiceAPI,
  ServiceAPIArgs,
  ServiceAPIReturns,
  ServiceAPIRoute,
  ServiceAPIType
} from "./hardware-service-api";
import { OVEExceptionSchema } from "@ove/ove-types";

/* Utility Types */

export type DeviceResponse<T extends z.ZodTypeAny> = z.ZodUnion<readonly [T, typeof OVEExceptionSchema]>;

/* Utility Schemas */

export const getDeviceResponseSchema = <T extends z.ZodTypeAny>(schema: T): DeviceResponse<T> => z.union([schema, OVEExceptionSchema]);

/* API Route Types */

export type ClientAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  client: DeviceResponse<U>;
} & { [Key in keyof ServiceAPIRoute<A, U>]: ServiceAPIRoute<A, U>[Key] };

export type ClientAPIRoutesType = {
  [Key in keyof ServiceAPIType]: ClientAPIRoute<ServiceAPIArgs<Key>, ServiceAPIReturns<Key>>
};

/* API */

export const ClientAPIRoutes: ClientAPIRoutesType = (Object.keys(ServiceAPI) as Array<keyof typeof ServiceAPI>).reduce((acc, k) => {
  return {
    ...acc,
    [k]: {
      returns: ServiceAPI[k].returns,
      args: ServiceAPI[k].args,
      client: getDeviceResponseSchema(ServiceAPI[k].returns)
    }
  };
}, {} as ClientAPIRoutesType);

/* API Utility Types */

export type ClientAPIArgs<Key extends keyof ClientAPIRoutesType> = ClientAPIRoutesType[Key]["args"]["shape"];
export type ClientAPIReturns<Key extends keyof ClientAPIRoutesType> = ClientAPIRoutesType[Key]["returns"];
export type ClientAPIResponse<Key extends keyof ClientAPIRoutesType> = ClientAPIRoutesType[Key]["client"];
