import { type InboundAPI } from "@ove/ove-types";

export const inboundChannels: InboundAPIChannels = {
  getDevice: "get-device",
  addDevice: "add-device",
  removeDevice: "remove-device",
  getDevicesToAuth: "get-devices-auth",
  getAppVersion: "get-server-version",
  getPublicKey: "get-public-key",
  registerAuth: "edit-device-hardware-auth",
  updateEnv: "update-env",
  getEnv: "get-env",
  getDevices: "get-devices",
  setAutoSchedule: "set-auto-schedule",
  setEcoSchedule: "set-eco-schedule",
  setManualSchedule: "set-manual-schedule",
  getMode: "get-mode",
  getSocketStatus: "get-socket-status",
  getCalendar: "get-main-config",
  getAutoSchedule: "get-auto-schedule",
  getStreams: "get-video-streams",
  startStreams: "start-videos",
  stopStreams: "stop-videos",
  getGeometry: "get-geometry"
};

export type InboundAPIChannels = {
  [Key in keyof InboundAPI]: string
}

// client -> server
// export type InboundAPI = {
//   getAppVersion: () => Promise<string>
//   getDevicesToAuth: () => Promise<Device[]>
//   getPublicKey: () => Promise<string>
//   registerAuth: (id: string, pin: string) => Promise<boolean>
//   updateEnv: (env: {bridgeName?: string, coreURL?: string, calendarURL?: string}) => Promise<void>
//   getEnv: () => Promise<{bridgeName?: string, coreURL?: string, calendarURL?: string}>
//   getDevices: () => Promise<Device[]>
//   saveDevice: (device: Device) => Promise<void>
//   deleteDevice: (deviceId: string) => Promise<void>
//   setAutoSchedule: (schedule?: AutoSchedule) => Promise<void>
//   setEcoSchedule: (schedule: CalendarEvent[]) => Promise<void>
//   clearSchedule: () => Promise<void>
//   getMode: () => Promise<PowerMode>
//   getSocketStatus: () => Promise<boolean>
//   getCalendar: () => Promise<Calendar | undefined>
//   getAutoSchedule: () => Promise<AutoSchedule | undefined>
//   getStreams: () => Promise<string[] | undefined>
//   startStreams: () => Promise<boolean>
//   stopStreams: () => Promise<boolean>
// }

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