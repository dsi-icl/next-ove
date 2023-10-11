import {
  type AutoSchedule,
  type CalendarEvent,
  type Device,
  type Calendar,
  type PowerMode
} from "@ove/ove-types";

export const inboundChannels: InboundAPIChannels = {
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
  hasCalendar: "has-calendar",
  getAutoSchedule: "get-auto-schedule",
  getStreams: "get-video-streams",
  startStreams: "start-videos",
  stopStreams: "stop-videos"
};

export type InboundAPIChannels = {
  [Key in keyof InboundAPI]: string
}

// client -> server
export type InboundAPI = {
  getAppVersion: () => Promise<string>
  getDevicesToAuth: () => Promise<Device[]>
  getPublicKey: () => Promise<string>
  registerAuth: (id: string, pin: string) => Promise<boolean>
  updateEnv: (coreURL: string, bridgeName: string, calendarURL: string | undefined) => Promise<void>
  getEnv: () => Promise<{bridgeName?: string, coreURL?: string, calendarURL?: string}>
  getDevices: () => Promise<Device[]>
  saveDevice: (device: Device) => Promise<void>
  deleteDevice: (deviceId: string) => Promise<void>
  setAutoSchedule: (schedule?: AutoSchedule) => Promise<void>
  setEcoSchedule: (schedule: CalendarEvent[]) => Promise<void>
  clearSchedule: () => Promise<void>
  getMode: () => Promise<PowerMode>
  getSocketStatus: () => Promise<boolean>
  getCalendar: () => Promise<Calendar | undefined>
  hasCalendar: () => Promise<boolean>
  getAutoSchedule: () => Promise<AutoSchedule | undefined>
  getStreams: () => Promise<string[] | undefined>
  startStreams: () => Promise<boolean>
  stopStreams: () => Promise<boolean>
}

export const outboundChannels: OutboundAPIChannels = {
  socketConnect: "socket-connect",
  socketDisconnect: "socket-disconnect"
};

export type OutboundAPIChannels = {
  [Key in keyof OutboundAPI]: string
}

// server -> client
export type OutboundAPI = {
  socketConnect: () => void
  socketDisconnect: () => void
}