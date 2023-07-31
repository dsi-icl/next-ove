import {
  AutoSchedule,
  CalendarEvent,
  Device,
  OutlookEvents,
  PowerMode
} from "@ove/ove-types";

export const channels: APIChannels = {
  getDevicesToAuth: "get-devices-auth",
  getAppVersion: "get-app-version",
  getPublicKey: "get-public-key",
  registerAuth: "edit-device-hardware-auth",
  updateEnv: "update-env",
  getEnv: "get-env",
  getDevices: "get-devices",
  saveDevice: "save-device",
  deleteDevice: "delete-device",
  setAutoSchedule: "set-auto-schedule",
  setEcoSchedule: "set-eco-schedule",
  clearSchedule: "clear-schedule",
  getMode: "get-mode",
  getSocketStatus: "get-socket-status",
  getCalendar: "get-calendar",
  updateCalendar: "update-calendar",
  hasCalendar: "has-calendar",
  getAutoSchedule: "get-auto-schedule"
};

export type APIChannels = {
  [Key in keyof API]: string
}

export type API = {
  getAppVersion: () => Promise<string>
  getDevicesToAuth: () => Promise<Device[]>
  getPublicKey: () => Promise<string>
  registerAuth: (id: string) => Promise<void>
  updateEnv: (coreURL: string, bridgeName: string, calendarURL: string | undefined) => Promise<void>
  getEnv: () => Promise<{bridgeName: string, coreURL: string, calendarURL?: string}>
  getDevices: () => Promise<Device[]>
  saveDevice: (device: Device) => Promise<void>
  deleteDevice: (deviceId: string) => Promise<void>
  setAutoSchedule: (schedule?: AutoSchedule) => Promise<void>
  setEcoSchedule: (schedule: CalendarEvent[]) => Promise<void>
  clearSchedule: () => Promise<void>
  getMode: () => Promise<PowerMode>
  getSocketStatus: () => Promise<boolean>
  getCalendar: () => Promise<OutlookEvents>
  updateCalendar: (accessToken: string) => Promise<OutlookEvents | null>
  hasCalendar: () => Promise<boolean>
  getAutoSchedule: () => Promise<AutoSchedule>
}