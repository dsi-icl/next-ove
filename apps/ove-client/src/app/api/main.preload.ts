/* global process */

import { contextBridge, ipcRenderer } from "electron";
import { channels } from "@ove/ove-client-shared";

contextBridge.exposeInMainWorld("electron", {
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  platform: process.platform,
  getNotifications: async () => ipcRenderer.invoke(channels.GET_NOTIFICATIONS),
  getInfo: async (type?: string) => ipcRenderer.invoke(channels.GET_INFO, type),
});
