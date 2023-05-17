import { Device } from "@ove/ove-types";

export const channels: APIChannels = {
  getDevicesToAuth: "get-auth",
  getAppVersion: "get-app-version",
  getPublicKey: "get-public-key",
  registerAuth: "register-auth"
};

export type APIChannels = {
  [Key in keyof API]: string
}

export type API = {
  getAppVersion: () => Promise<string>
  getDevicesToAuth: () => Promise<Device[]>
  getPublicKey: () => Promise<string>
  registerAuth: (id: string) => Promise<void>
}