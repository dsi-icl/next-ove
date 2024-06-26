import type { Device, StatusOptions } from "@ove/ove-types";

export type HardwareInfo = {
  device: Device
  status: StatusOptions
}

export type ActionController = {
  device: Device
  bridgeId: string
}

export type Action =
  "status"
  | "info"
  | "execute"
  | "screenshot"
  | "input_change"
  | "browser"
  | "volume"
  | "monitoring"
  | "calendar"
  | "power_mode"

export type DeviceAction = {
  bridgeId: string | null
  deviceId: string | null
  tag?: string
  action: Action | null
  pending: boolean
}

export type FilterType = "id" | "tags"

export type ActionProps = {
  bridgeId: string
  deviceId: string | null
  tag?: string
}
