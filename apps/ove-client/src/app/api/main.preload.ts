/* global process */

import { contextBridge, ipcRenderer } from "electron";
import { API, channels } from "@ove/ove-client-shared";

// noinspection DuplicatedCode
const ExposedAPI: API = (Object.keys(channels) as Array<keyof API>).reduce((acc, k) => {
  return {
    ...acc,
    [k]: async (...args: any[]) => ipcRenderer.invoke(channels[k], ...args)
  };
}, {} as API);

// TODO: replace receive with typesafe version
contextBridge.exposeInMainWorld("electron", {
  receive: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => {
      listener(...args);
    });
  },
  ...ExposedAPI
});
