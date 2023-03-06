import { wake } from "../utils/wol";
import { DeviceService } from "../utils/types";
import { AppRouter } from "@ove/ove-client-router";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import fetch from "node-fetch";
import * as ws from "ws";
import { Device, Status } from "@ove/ove-types";

const globalAny = global as any;
globalAny.AbortController = AbortController;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

const createClient = (device: Device) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `http://${device.ip}:${device.port}/api/v1/trpc`
      })
    ]
  });

const reboot = async (device: Device): Promise<string> => createClient(device).reboot.query();

const shutdown = async (device: Device): Promise<string> => createClient(device).shutdown.query();

const start = async (device: Device): Promise<boolean> => wake(device.mac, { address: device.ip });

const info = async (device: Device, type?: string) => createClient(device).getInfo.query({ type });

const status = async (device: Device): Promise<{ status: string }> => createClient(device).getStatus.query();

const execute = async (device: Device, command: string): Promise<string> => createClient(device).execute.query({ command });

const screenshot = async (device: Device, method: string, format: string, screens: number[]): Promise<(string)[]> => createClient(device).screenshot.query({
  method,
  screens,
  format
});

const openBrowser = async (device: Device, displayId: number): Promise<number> => createClient(device).openBrowser.query({ displayId });

const getBrowserStatus = async (device: Device, id: number): Promise<{ status: string }> => createClient(device).getBrowserStatus.query({ id });

const closeBrowser = async (device: Device, id: number): Promise<Status> => {
  await createClient(device).closeBrowser.query({ id });
  return { status: "Closed browser" };
};

const closeBrowsers = async (device: Device): Promise<Status> => {
  await createClient(device).closeBrowsers.query();
  return { status: "Closed browsers" };
};

const getBrowsers = async (device: Device): Promise<number[]> => createClient(device).getBrowsers.query();

const setVolume = async () => {
  throw new Error();
};

const mute = async () => {
  throw new Error();
};

const unmute = async () => {
  throw new Error();
};

const setSource = async () => {
  throw new Error();
};

const NodeService: DeviceService = {
  reboot,
  shutdown,
  start,
  info,
  status,
  execute,
  screenshot,
  openBrowser,
  getBrowserStatus,
  closeBrowser,
  getBrowsers,
  closeBrowsers,
  setVolume,
  setSource,
  mute,
  unmute
};

export default NodeService;


