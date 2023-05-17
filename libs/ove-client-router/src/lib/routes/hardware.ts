import {
  ClientAPI,
  ClientAPIKeysType, ClientAPIMethod, ClientAPIType,
  ClientServiceAPIType,
  ClientServiceArgs,
  ClientServiceReturns, ID
} from "@ove/ove-types";
import { DesktopCapturerSource } from "electron";
import { protectedProcedure, router } from "../trpc";
import Service from "@ove/ove-client-control";
import { state, updatePin } from "../state";

const service = Service();

const controller: ClientServiceAPIType = {
  getStatus: async () => true,
  getInfo: async ({ type }) => service.getInfo(type),
  getBrowserStatus: async ({ browserId }) =>
    (Object.keys(state.browsers).includes(browserId.toString())),
  getBrowsers: async () => Object
    .keys(state.browsers)
    .map(parseInt),
  reboot: async () => service.reboot(),
  shutdown: async () => service.shutdown(),
  execute: async ({ command }) => service.execute(command),
  screenshot: async ({
    method,
    screens
  }) => service.screenshot(method, screens),
  openBrowser: async ({ displayId, url }) => {
    const idx = service.openBrowser(url, displayId);
    const browserId = Object.keys(state.browsers).length;
    state.browsers[browserId] = { idx };

    return browserId;
  },
  closeBrowser: async ({ browserId }) => {
    service.closeBrowser(state.browsers[browserId]);
    delete state.browsers[browserId];
    return true;
  },
  closeBrowsers: async () => {
    service.closeBrowsers(Object.values(state.browsers));
    state.browsers = {};
    return true;
  }
};

const applyController = async <
  Key extends keyof ClientServiceAPIType
>(k: Key, args: ClientServiceArgs<Key>): Promise<ClientServiceReturns<Key>> =>
  controller[k](args);

export const init = (
  createWindow: (url?: string, displayId?: ID) => string,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>,
  closeWindow: (idx: string) => void,
  triggerIPC: (event: string, ...args: any[]) => void
) => {
  service.init(createWindow, takeScreenshots, closeWindow);
  state.pinUpdateCallback = (pin: string) => triggerIPC("update-pin", pin);
  setTimeout(updatePin, 5_000);
  setInterval(updatePin, 30_000);
};

const generateProcedure = <Key extends ClientAPIKeysType>(k: Key) =>
  protectedProcedure
    .meta(ClientAPI[k].meta)
    .input<ClientAPIType[typeof k]["args"]>(ClientAPI[k].args)
    .output<ClientAPIType[typeof k]["returns"]>(ClientAPI[k].returns);

const generateQuery = <Key extends ClientAPIKeysType>(k: Key) => generateProcedure<Key>(k)
  .query<ClientServiceReturns<Key>>(async ({ input }) => await applyController<Key>(k, input as ClientServiceArgs<Key>));

const generateMutation = <Key extends ClientAPIKeysType>(k: Key) => generateProcedure<Key>(k)
  .mutation<ClientServiceReturns<Key>>(async ({ input }) =>
    await applyController<typeof k>(k, input));

type Router = {
  [Key in ClientAPIKeysType]: ClientAPIMethod<Key> extends "GET" ?
    ReturnType<typeof generateQuery<Key>> : ReturnType<typeof generateMutation<Key>>
}

const routes = (Object.keys(ClientAPI) as Array<keyof ClientServiceAPIType>)
  .reduce((acc, k) => ({
    ...acc,
    [k]: ClientAPI[k].meta.openapi.method === "GET" ?
      generateQuery(k) : generateMutation(k)
  }), {} as Router);

export const hardwareRouter = router(routes);