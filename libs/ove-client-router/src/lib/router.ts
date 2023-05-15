import { mergeRouters, procedure, router } from "./trpc";
import { DesktopCapturerSource } from "electron";
import { Service } from "@ove/ove-client-control";
import {
  Browser,
  ClientAPI,
  ClientAPIKeysType,
  ClientAPIMethod, ClientAPIType,
  ClientServiceAPIType,
  ClientServiceArgs,
  ClientServiceReturns,
  ID, StatusSchema
} from "@ove/ove-types";
import { z } from "zod";
import { readAsset, toAsset } from "@ove/file-utils";

const service = Service.default();

type State = {
  browsers: { [browserId: ID]: Browser }
  authorisedCredentials: string[]
};

const state: State = {
  browsers: {},
  authorisedCredentials: []
};

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
>(k: Key, args: ClientServiceArgs<Key>): ClientServiceReturns<Key> =>
  controller[k](args);

export const init = (
  createWindow: (url?: string, displayId?: ID) => string,
  takeScreenshots: () => Promise<DesktopCapturerSource[]>,
  closeWindow: (idx: string) => void
) => {
  service.init(createWindow, takeScreenshots, closeWindow);
};

const generateProcedure = <Key extends ClientAPIKeysType>(k: Key) =>
  procedure
    .meta(ClientAPI[k].meta)
    .input<ClientAPIType[typeof k]["args"]>(ClientAPI[k].args)
    .output<ClientAPIType[typeof k]["returns"]>(ClientAPI[k].returns);

const generateQuery = <Key extends ClientAPIKeysType>(k: Key) => generateProcedure<Key>(k)
  .query<ClientServiceReturns<Key>>(async ({ input }) =>
    applyController<Key>(k, input as ClientServiceArgs<Key>));

const generateMutation = <Key extends ClientAPIKeysType>(k: Key) => generateProcedure<Key>(k)
  .mutation<ClientServiceReturns<Key>>(async ({ input }) =>
    applyController<typeof k>(k, input));

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

const authRouter = router({
  register: procedure
    .meta({ openapi: { method: "POST", path: "/register" } })
    .input(z.object({ pin: z.string(), key: z.string() }))
    .output(StatusSchema)
    .mutation(({ input: { pin, key } }) => {
      const notifications = readAsset("notifications.json", JSON.stringify([]));
      toAsset("notifications.json", [...notifications, { pin, key }]);
      return true;
    })
});

const hardwareRouter = router(routes);

export const appRouter = mergeRouters(hardwareRouter, authRouter);

// noinspection JSUnusedGlobalSymbols
export type AppRouter = typeof appRouter;
