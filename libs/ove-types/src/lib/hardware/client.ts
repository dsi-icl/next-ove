import { z } from "zod";
import { ClientAPIRoutes, ClientAPIRoutesType } from "./client-transform";
import { ServiceAPIRoutesType } from "./service";

export { type ClientAPIMethod } from "./client-transform";

/* API Keys */

export type ClientAPIKeys = keyof Pick<ServiceAPIRoutesType, "getStatus" | "getInfo" | "getBrowserStatus" | "getBrowsers" | "reboot" | "shutdown" | "execute" | "screenshot" | "openBrowser" | "closeBrowser" | "closeBrowsers">;
export const ClientAPIKeys: readonly ClientAPIKeys[] = ["getStatus", "getInfo", "getBrowserStatus", "getBrowsers", "reboot", "shutdown", "execute", "screenshot", "openBrowser", "closeBrowser", "closeBrowsers"];

/* API Types */

export type ClientServiceAPIType = {
  [Key in ClientAPIKeys]: (args: z.infer<ClientAPIRoutesType[Key]["args"]>) => Promise<z.infer<ClientAPIRoutesType[Key]["client"]>>
};

export type ClientAPIType = {
  [Key in ClientAPIKeys]: ClientAPIRoutesType[Key]
};

/* API */

export const ClientAPI: ClientAPIType = ClientAPIKeys.reduce((acc, k) => {
  return {
    ...acc,
    [k]: ClientAPIRoutes[k]
  }
}, {} as ClientAPIType);

/* API Utility Types */

export type ClientServiceArgs<Key extends keyof ClientServiceAPIType> = z.infer<ClientAPIRoutesType[Key]["args"]>;
export type ClientServiceReturns<Key extends keyof ClientServiceAPIType> = Promise<z.infer<ClientAPIRoutesType[Key]["returns"]>>;