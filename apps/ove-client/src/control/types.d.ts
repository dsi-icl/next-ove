import type {GraphicsData} from "systeminformation";

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
  graphics: () => Promise<GraphicsData>
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
  openBrowser: (displayId?: number) => number
  getBrowserStatus: (browserId: number) => { status: string }
  closeBrowser: (browserId: number) => void
  getBrowsers: () => number[]
  closeBrowsers: () => void
  screenshot: (method: string, screens: number[], format?: string) => Promise<(Buffer | string)[]>
};

export type Browser = {
  controller: AbortController
  client?: object
};

export type State = {
  browsers: { [browserId: number]: Browser }
};

export type Display = {
  vendor: string,
  vendorId: string,
  model: string,
  productionYear: string,
  serial: string,
  displayId: string,
  main: boolean,
  builtin: boolean,
  connection: string,
  sizeX: number | null,
  sizeY: number | null,
  pixelDepth: number | null,
  resolutionX: number | null,
  resolutionY: number | null,
  currentResX: number,
  currentResY: number,
  positionX: number,
  positionY: number,
  currentRefreshRate: number
}
