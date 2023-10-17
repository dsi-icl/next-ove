import { type Device } from "@ove/ove-types";

export type HardwareInfo = {
  device: Device
  status: "running" | "off" | null
}

export type ActionController = {
  device: Device
  setDeviceAction: (deviceAction: DeviceAction) => void
}

type Action = "status" | "info" | "start" | "shutdown" | "reboot" | "execute" | "screenshot" | "input_change" | "browser_status" | "browser_open" | "browser_close" | "browsers_close" | "monitoring" | "calendar";

export type DeviceAction = { deviceId: string | null, action: Action | null, pending: boolean };

export type DeviceStatus = "running" | "off" | null;