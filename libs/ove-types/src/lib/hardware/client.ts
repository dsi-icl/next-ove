import { z } from "zod";
import { ClientAPIRoutes, ClientAPIRoutesType } from "./client-transform";
import { ServiceAPIRoutesType } from "./service";

export { type ClientAPIMethod } from "./client-transform";

/* API Keys */

export type ClientAPIKeysType = {
  [Key in keyof ServiceAPIRoutesType]: ServiceAPIRoutesType[Key]["exposed"] extends "client" ? Key : never
}[keyof ServiceAPIRoutesType]

/* API Types */

export type ClientServiceAPIType = {
  [Key in ClientAPIKeysType]:
  (args: z.infer<ClientAPIRoutesType[Key]["args"]>) =>
    Promise<z.infer<ClientAPIRoutesType[Key]["client"]>>
};

export type ClientAPIType = {
  [Key in ClientAPIKeysType]: ClientAPIRoutesType[Key]
};

/* API */

export const ClientAPI: ClientAPIType =
  (Object.keys(ClientAPIRoutes) as Array<keyof ServiceAPIRoutesType>)
    .filter(key => ClientAPIRoutes[key].exposed === "client")
    .reduce((acc, k) => {
      return {
        ...acc,
        [k]: ClientAPIRoutes[k]
      };
    }, {} as ClientAPIType);

/* API Utility Types */

export type ClientServiceArgs<Key extends keyof ClientServiceAPIType> =
  z.infer<ClientAPIRoutesType[Key]["args"]>;
export type ClientServiceReturns<Key extends keyof ClientServiceAPIType> =
  Promise<z.infer<ClientAPIRoutesType[Key]["returns"]>>;
