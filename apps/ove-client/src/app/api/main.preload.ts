import { contextBridge, ipcRenderer } from "electron";
import {
  inboundChannels,
  type InboundAPI,
  type OutboundAPI,
  type OutboundAPIChannels
} from "../../ipc-routes";
import { syncRandom, setup } from "@ove/ove-mirror-tools";
import { generateUUID } from "@ove/ove-utils";

// NOTE: must be called here, to allow for random ID generation
let id = generateUUID();

syncRandom();

// noinspection DuplicatedCode
const ExposedAPI: InboundAPI =
  (Object.keys(inboundChannels) as Array<keyof InboundAPI>)
    .reduce((acc, k) => ({
      ...acc,
      [k]: async (...args: Parameters<InboundAPI[typeof k]>[]) =>
        ipcRenderer.invoke(inboundChannels[k], ...args)
    }), {} as InboundAPI);

contextBridge.exposeInMainWorld("client", {
  receive: <Key extends keyof OutboundAPI>(
    channel: OutboundAPIChannels[Key],
    listener: (...args: Parameters<OutboundAPI[Key]>)
      => ReturnType<OutboundAPI[Key]>
  ) => {
    ipcRenderer.on(channel, (_event, ...args) => {
      listener(...args as Parameters<OutboundAPI[Key]>);
    });
  },
  ...ExposedAPI
});

let sectionId = new URLSearchParams(window.location.search.substring(1)).get("sectionId");

if (
  document.readyState === 'complete' ||
  document.readyState === 'interactive'
) {
  setup(id, sectionId);
} else {
  document.addEventListener('DOMContentLoaded', () => setup(id, sectionId));
}