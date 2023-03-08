import { DesktopCapturerSource } from "electron";
import {z} from "zod";
import {
  AudioSchema,
  BatterySchema, BluetoothSchema,
  CpuSchema, DockerSchema, FsSchema,
  GeneralSchema,
  GraphicsSchema,
  MemorySchema, NetworkSchema,
  OsSchema, PrinterSchema, ProcessesSchema,
  SystemSchema, UsbSchema, VBoxSchema, WifiSchema
} from "@ove/ove-types";

export type SystemInfo = {
  general: () => z.infer<typeof GeneralSchema>
  system: () => Promise<z.infer<typeof SystemSchema>>
  cpu: () => Promise<z.infer<typeof CpuSchema>>
  memory: () => Promise<z.infer<typeof MemorySchema>>
  battery: () => Promise<z.infer<typeof BatterySchema>>
  graphics: () => Promise<z.infer<typeof GraphicsSchema>>
  os: () => Promise<z.infer<typeof OsSchema>>
  processes: () => Promise<z.infer<typeof ProcessesSchema>>
  fs: () => Promise<z.infer<typeof FsSchema>>
  usb: () => Promise<z.infer<typeof UsbSchema>>
  printer: () => Promise<z.infer<typeof PrinterSchema>>
  audio: () => Promise<z.infer<typeof AudioSchema>>
  network: () => Promise<z.infer<typeof NetworkSchema>>
  wifi: () => Promise<z.infer<typeof WifiSchema>>
  bluetooth: () => Promise<z.infer<typeof BluetoothSchema>>
  docker: () => Promise<z.infer<typeof DockerSchema>>
  vbox: () => Promise<z.infer<typeof VBoxSchema>>
};

export type SystemControl = {
  shutdown: () => Buffer
  reboot: () => Buffer
  execute: (command: string) => Buffer
};

export type BrowserControl = {
  init: (createWindow: (displayId?: number) => void, takeScreenshots: () => Promise<DesktopCapturerSource[]>) => void
  openBrowser: (displayId?: number) => void
  closeBrowser: (browser: Browser) => void
  closeBrowsers: (browsers: Browser[]) => void
  screenshot: (method: string, screens: number[]) => Promise<string[]>
};

export type Browser = {
  controller: AbortController
  client?: object
};
