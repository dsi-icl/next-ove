import { Device } from "@ove/ove-types";

export const channels: APIChannels = {
  getDevicesToAuth: "get-devices-auth",
  getAppVersion: "get-app-version",
  getPublicKey: "get-public-key",
  registerAuth: "edit-device-hardware-auth",
  updateEnv: "update-env",
  getEnv: "get-env",
  getDevices: "get-devices",
  saveDevice: "save-device",
  deleteDevice: "delete-device"
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
  getDevices: () => Promise<Device[]>
  saveDevice: (device: Device) => Promise<void>
  deleteDevice: (deviceId: string) => Promise<void>
}