import {
  RouteMethod,
  ServiceAPI,
  ServiceAPIArgs, ServiceAPIMethod,
  ServiceAPIReturns,
  ServiceAPIRoute,
  ServiceAPIRoutesType
} from "./service";
import { OVEExceptionSchema } from "@ove/ove-types";
import { z } from "zod";

/* Utility Types */

export type DeviceResponse<T extends z.ZodTypeAny> = z.ZodUnion<readonly [T, typeof OVEExceptionSchema]>;

/* Utility Schemas */

export const getDeviceResponseSchema = <T extends z.ZodTypeAny>(schema: T): DeviceResponse<T> => z.union([schema, OVEExceptionSchema]);

/* API Route Types */

export type ClientAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny, M extends RouteMethod> =
  {
    client: DeviceResponse<U>;
  }
  & { [Key in keyof ServiceAPIRoute<A, U, M>]: ServiceAPIRoute<A, U, M>[Key] };

/* API Type */

export type ClientAPIRoutesType = {
  [Key in keyof ServiceAPIRoutesType]: ClientAPIRoute<ServiceAPIArgs<Key>, ServiceAPIReturns<Key>, ServiceAPIMethod<Key>>
};

/* API */

export const ClientAPIRoutes: ClientAPIRoutesType = (Object.keys(ServiceAPI) as Array<keyof typeof ServiceAPI>).reduce((acc, k) => {
  return {
    ...acc,
    [k]: {
      meta: ServiceAPI[k].meta,
      returns: ServiceAPI[k].returns,
      args: ServiceAPI[k].args,
      client: getDeviceResponseSchema(ServiceAPI[k].returns)
    }
  };
}, {} as ClientAPIRoutesType);

/* API Utility Types */

export type ClientAPIMethod<Key extends keyof ClientAPIRoutesType> = ClientAPIRoutesType[Key]["meta"]["openapi"]["method"];
export type ClientAPIArgs<Key extends keyof ClientAPIRoutesType> = ClientAPIRoutesType[Key]["args"]["shape"];
export type ClientAPIReturns<Key extends keyof ClientAPIRoutesType> = ClientAPIRoutesType[Key]["returns"];