/* global process */

import { contextBridge, ipcRenderer } from "electron";
import { API, channels } from "@ove/ove-bridge-shared";

// noinspection DuplicatedCode
const ExposedAPI: API = (Object.keys(channels) as Array<keyof API>).reduce((acc, k) => {
  return {
    ...acc,
    [k]: async (...args: any[]) => ipcRenderer.invoke(channels[k], ...args)
  };
}, {} as API);

contextBridge.exposeInMainWorld("electron", {
  receive: (channel: string, listener: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (_event, ...args) => {
      listener(...args);
    });
  },
  ...ExposedAPI
});
