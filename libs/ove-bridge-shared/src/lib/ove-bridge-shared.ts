import { Device } from "@ove/ove-types";

export const channels: APIChannels = {
  getDevicesToAuth: "get-auth",
  getAppVersion: "get-app-version",
  getPublicKey: "get-public-key",
  registerAuth: "register-auth",
  updateEnv: "update-env",
  getEnv: "get-env",
};

export type APIChannels = {
  [Key in keyof API]: string
}

export type API = {
  getAppVersion: () => Promise<string>
  getDevicesToAuth: () => Promise<Device[]>
  getPublicKey: () => Promise<string>
  registerAuth: (id: string) => Promise<void>
  updateEnv: (coreURL: string, bridgeName: string) => Promise<void>
  getEnv: () => Promise<{bridgeName: string, coreURL: string}>
}