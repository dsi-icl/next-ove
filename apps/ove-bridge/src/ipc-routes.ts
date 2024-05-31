import type { InboundAPI } from "@ove/ove-types";

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
  getGeometry: "get-geometry",
  refreshReconciliation: "refresh-reconciliation",
  startReconciliation: "start-reconciliation",
  stopReconciliation: "stop-reconciliation"
};

export type InboundAPIChannels = {
  [_Key in keyof InboundAPI]: string
}

export const outboundChannels: OutboundAPIChannels = {
  socketConnect: "socket-connect",
  socketDisconnect: "socket-disconnect"
};

export type OutboundAPIChannels = {
  [_Key in keyof OutboundAPI]: string
}

// server -> client
export type OutboundAPI = {
  socketConnect: () => void
  socketDisconnect: () => void
}
