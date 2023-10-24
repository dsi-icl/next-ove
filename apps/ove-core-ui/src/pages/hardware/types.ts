import { type Device } from "@ove/ove-types";

export type HardwareInfo = {
  device: Device
  status: "running" | "off" | null
}

export type ActionController = {
  device: Device
  bridgeId: string
}

export type Action = "status" | "info" | "start" | "shutdown" | "reboot" | "execute" | "screenshot" | "input_change" | "browser" | "browsers" | "browser_open" | "browser_close" | "browsers_close" | "monitoring" | "calendar" | "power_mode";

export type DeviceAction = { bridgeId: string | null, deviceId: string | null, action: Action | null, pending: boolean };

export type DeviceStatus = "running" | "off" | null;