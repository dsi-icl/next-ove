import { wake } from "../utils/wol";
import { DeviceResult, DeviceService } from "../utils/types";
import { appRouter } from "../../../ove-client/src/control/router";

const trpc = appRouter.createCaller({});

const reboot = async (): Promise<DeviceResult> => trpc.reboot();

const shutdown = async (): Promise<DeviceResult> => trpc.shutdown();

const start = async (ip: string, port: number, mac: string): Promise<DeviceResult> => wake(mac, { address: ip });

const info = async (type: string | undefined): Promise<DeviceResult> => trpc.getInfo({type});

const status = async (): Promise<DeviceResult> => trpc.getStatus();

const execute = async (command: string): Promise<DeviceResult> => trpc.execute({command});

const screenshot = async (method: string, format: string, screens: number[]): Promise<DeviceResult> => trpc.screenshot({method, screens, format});

const openBrowser = async (displayId: number): Promise<DeviceResult> => trpc.openBrowser({ displayId });

const getBrowserStatus = async (id: number): Promise<DeviceResult> => trpc.getBrowserStatus({id});

const closeBrowser = async (id: number): Promise<DeviceResult> => trpc.closeBrowser({id});

const closeBrowsers = async (): Promise<DeviceResult> => trpc.closeBrowsers();

const getBrowsers = async (): Promise<DeviceResult> => trpc.getBrowsers();

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
  closeBrowsers
};

export default NodeService;


