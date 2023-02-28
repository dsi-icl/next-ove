import { Systeminformation } from "systeminformation";
import GraphicsData = Systeminformation.GraphicsData;
import { DesktopCapturerSource } from "electron";

export type SystemInfo = {
  general: () => {
    version: string,
    time: object
  }
  system: () => Promise<{
    general: object
    bios: object
    baseboard: object
    chassis: object
  }>
  cpu: () => Promise<{
    general: object
    flags: string,
    cache: object
    currentSpeed: object
    temperature: object
  }>
  memory: () => Promise<{
    general: object
    layout: object[]
  }>
  battery: () => Promise<{
    general: object
  }>
  graphics: () => Promise<{general: GraphicsData}>
  os: () => Promise<{
    general: object
    uuid: object
    versions: object
    shell: string
    users: object[]
  }>
  processes: () => Promise<{
    currentLoad: object,
    fullLoad: number
    processes: object
  }>
  fs: () => Promise<{
    diskLayout: object[]
    blockDevices: object[]
    disksIO: object
    fsSize: object[]
    fsOpenFiles: object[]
    fsStats: object
  }>
  usb: () => Promise<{
    general: object[]
  }>
  printer: () => Promise<{
    general: object[]
  }>
  audio: () => Promise<{
    general: object[]
  }>
  network: () => Promise<{
    interfaces: object[]
    interfaceDefault: string
    gatewayDefault: string
    stats: object[]
    connections: object[]
    inetChecksite: object
    inetLatency: number
  }>
  wifi: () => Promise<{
    networks: object[]
    interfaces: object[]
    connections: object[]
  }>
  bluetooth: () => Promise<{
    devices: object[]
  }>
  docker: () => Promise<{
    general: object
    images: object[]
    containers: object[]
    containerStats: object[]
    containerProcesses: object[]
    volumes: object[]
  }>
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
  screenshot: (method: string, screens: number[], format?: string) => Promise<(Buffer | string)[]>
};

export type Browser = {
  controller: AbortController
  client?: object
};
