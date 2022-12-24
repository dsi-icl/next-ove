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
  graphics: () => Promise<{
    general: object
  }>
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
  shutdown: () => void
  reboot: () => void
  execute: (command: string, callback: (string) => void) => void
  screenshot: (method: string, screens: string[], format?: string) => Promise<(Buffer | string)[]>
};

export type BrowserControl = {
  openBrowser: () => number
  getBrowserStatus: (browserId: number) => string
  closeBrowser: (browserId: number) => void
  getBrowsers: () => number[]
  closeBrowsers: () => void
};

export type Browser = {
  controller: AbortController
  client?: object
};

export type State = {
  browsers: {[browserId: number]: Browser}
};
