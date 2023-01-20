import { wake } from "../utils/wol";
import { DeviceResult, DeviceService } from "../utils/types";
import {createTRPCProxyClient, httpBatchLink} from "@trpc/client";
import type {AppRouter} from "../../../ove-control-client/src/routes/app";

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "http://localhost:3335/api/v1/trpc"
    })
  ]
});

const reboot = async (): Promise<DeviceResult> => trpc.reboot.query();

const shutdown = async (): Promise<DeviceResult> => trpc.shutdown.query();

const start = async (ip: string, port: number, mac: string): Promise<DeviceResult> => wake(mac, { address: ip });

const info = async (type: string | undefined): Promise<DeviceResult> => trpc.getInfo.query({type});

const status = async (): Promise<DeviceResult> => trpc.getStatus.query();

const execute = async (command: string): Promise<DeviceResult> => trpc.execute.query({command});

const screenshot = async (method: string, format: string, screens: string[]): Promise<DeviceResult> => trpc.screenshot.query({method, screens, format});

const openBrowser = async (): Promise<DeviceResult> => trpc.openBrowser.query();

const getBrowserStatus = async (id: number): Promise<DeviceResult> => trpc.getBrowserStatus.query({id});

const closeBrowser = async (id: number): Promise<DeviceResult> => trpc.closeBrowser.query({id});

const getBrowsers = async (): Promise<DeviceResult> => trpc.getBrowsers.query();

const getDisplays = async (): Promise<DeviceResult> => trpc.getDisplays.query();

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
  getDisplays
};

export default NodeService;


