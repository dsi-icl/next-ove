import { contextBridge, ipcRenderer } from "electron";
import {
  type InboundAPI,
  inboundChannels,
  type OutboundAPI,
  type OutboundAPIChannels
} from "../../ipc-routes";

// noinspection DuplicatedCode
const ExposedAPI: InboundAPI =
  (Object.keys(inboundChannels) as Array<keyof InboundAPI>)
    .reduce((acc, k) => {
      return {
        ...acc,
        [k]: async (...args: Parameters<InboundAPI[typeof k]>) =>
          ipcRenderer.invoke(inboundChannels[k], ...args)
      };
    }, {} as InboundAPI);

contextBridge.exposeInMainWorld("electron", {
  receive: <Key extends keyof OutboundAPI>(
    channel: OutboundAPIChannels[Key],
    listener: (...args: Parameters<OutboundAPI[Key]>) =>
      ReturnType<OutboundAPI[Key]>
  ) => {
    ipcRenderer.on(channel, (_event, ...args) => {
      listener(...args as Parameters<OutboundAPI[Key]>);
    });
  },
  ...ExposedAPI
});
