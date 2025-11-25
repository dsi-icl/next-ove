/* global AbortController, setTimeout */

import {
  BrowserConfigSchema,
  type Device,
  ScreenshotMethodSchema,
  TBridgeHardwareService,
  type TBridgeServiceArgs,
  type TClientAPI
} from "@ove/ove-types";
import { z } from "zod";
import { env } from "../../env";
import { execSync } from "child_process";
import { syncStatus } from "../../utils/status";
import { createTRPCClient, httpLink } from "@trpc/client";
import { buildDeviceURL } from "@ove/ove-utils";
// IGNORE PATH - as importing only type, will not trigger full import on build
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from "../../../../ove-client/src/server/router";
import { controller } from "../reconciliation/controller";
import type { NodeState } from "../reconciliation/state";

const fixedEncodeURIComponent = (str: string) =>
  encodeURIComponent(str).replace(
    /[!'()*]/g,
    (c) => "%" + c.charCodeAt(0).toString(16),
  );

export const createClient = (
  device: Device,
): ReturnType<typeof createTRPCClient<AppRouter>> =>
  createTRPCClient<AppRouter>({
    links: [
      httpLink({
        url: `${buildDeviceURL(device)}/api/v${env.CLIENT_API_VERSION}/trpc`,
        headers: () => {
          return {
            Authorization: fixedEncodeURIComponent(
              `Bearer ${env.AUTH.API_KEY}`,
            ),
          };
        },
      }),
    ],
  });

const reboot = async (
  device: Device,
  args: TBridgeServiceArgs<"reboot">,
  ac?: () => AbortController,
) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).reboot.mutate(
    parsedOpts.data as z.infer<TClientAPI["reboot"]["args"]>,
    { signal: controller.signal },
  );
};

const shutdown = async (
  device: Device,
  args: TBridgeServiceArgs<"shutdown">,
  ac?: () => AbortController,
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).shutdown.mutate(
    parsedOpts.data as z.infer<TClientAPI["shutdown"]["args"]>,
    { signal: controller.signal },
  );
};

const start = async (
  device: Device,
  _args: TBridgeServiceArgs<"start">,
  _ac?: () => AbortController,
) => {
  if (env !== null && env.HARDWARE.SCRIPTS?.START_NODE !== undefined) {
    execSync(
      env.HARDWARE.SCRIPTS.START_NODE.replaceAll(
        "%MAC%",
        device.mac,
      ).replaceAll(
        "%BROADCAST%",
        env.HARDWARE.WOL_ADDRESS ?? "192.168.255.255",
      ),
    );
  }
  return true;
};

const getInfo = async (
  device: Device,
  args: TBridgeServiceArgs<"getInfo">,
  ac?: () => AbortController,
) => {
  const infoOptsSchema = z.object({ type: z.string().optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).getInfo.query(
    parsedOpts.data as z.infer<TClientAPI["getInfo"]["args"]>,
    { signal: controller.signal },
  );
};

const getStatus = async (
  device: Device,
  args: TBridgeServiceArgs<"getStatus">,
  ac?: () => AbortController,
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();

  return syncStatus(
    async () =>
      await createClient(device).getStatus.query(
        parsedOpts.data as z.infer<TClientAPI["getStatus"]["args"]>,
        { signal: controller.signal },
      ),
    device,
    controller,
  );
};

const execute = async (
  device: Device,
  args: TBridgeServiceArgs<"execute">,
  ac?: () => AbortController,
) => {
  const executeOptsSchema = z.object({ command: z.string() }).strict();
  const parsedOpts = executeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).execute.mutate(
    parsedOpts.data as z.infer<TClientAPI["execute"]["args"]>,
    { signal: controller.signal },
  );
};

const screenshot = async (
  device: Device,
  args: TBridgeServiceArgs<"screenshot">,
  ac?: () => AbortController,
) => {
  const screenshotOptsSchema = z.strictObject({
    method: ScreenshotMethodSchema,
    screens: z.array(z.number()).optional(),
  });
  const parsedOpts = screenshotOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).screenshot.mutate(
    parsedOpts.data as z.infer<TClientAPI["screenshot"]["args"]>,
    { signal: controller.signal },
  );
};

const openBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"openBrowsers">,
  ac?: () => AbortController,
) => {
  const openBrowserOptsSchema = z.strictObject({});
  const parsedOpts = openBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).openBrowsers.mutate(
    parsedOpts.data as z.infer<TClientAPI["openBrowsers"]["args"]>,
    { signal: controller.signal },
  );
};

const closeBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"closeBrowsers">,
  ac?: () => AbortController,
) => {
  const closeBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = closeBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).closeBrowsers.mutate(
    parsedOpts.data as z.infer<TClientAPI["closeBrowsers"]["args"]>,
    { signal: controller.signal },
  );
};

const reloadBrowser = async (
  device: Device,
  args: TBridgeServiceArgs<"reloadBrowser">,
  ac?: () => AbortController,
) => {
  const reloadBrowsersOptsSchema = z.strictObject({ browserId: z.number() });
  const parsedOpts = reloadBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).reloadBrowser.mutate(
    parsedOpts.data as z.infer<TClientAPI["reloadBrowser"]["args"]>,
    { signal: controller.signal },
  );
};

const reloadBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"reloadBrowsers">,
  ac?: () => AbortController,
) => {
  const reloadBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = reloadBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).reloadBrowsers.mutate(
    parsedOpts.data as z.infer<TClientAPI["reloadBrowsers"]["args"]>,
    { signal: controller.signal },
  );
};

const setBrowserConfig = async (
  device: Device,
  args: TBridgeServiceArgs<"setBrowserConfig">,
  ac?: () => AbortController,
) => {
  const setConfigOptsSchema = z.strictObject({
    config: BrowserConfigSchema,
  });
  const parsedOpts = setConfigOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  return createClient(device).setBrowserConfig.mutate(
    parsedOpts.data as z.infer<TClientAPI["setBrowserConfig"]["args"]>,
    { signal: controller.signal },
  );
};

const getBrowserConfig = async (
  device: Device,
  args: TBridgeServiceArgs<"getBrowserConfig">,
  ac?: () => AbortController,
) => {
  const configOptsSchema = z.object({});
  const parsedOpts = configOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const abortController = ac?.() ?? new AbortController();
  setTimeout(() => abortController.abort(), env.HARDWARE.TIMEOUTS.NODE);

  const res = await createClient(device).getBrowserConfig.query(
    parsedOpts.data as z.infer<TClientAPI["getBrowserConfig"]["args"]>,
    { signal: abortController.signal },
  );
  (controller.getState()[device.id] as NodeState).browserConfigs.observed = res;
  return res;
};

const getBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"getBrowsers">,
  ac?: () => AbortController,
) => {
  const getBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = getBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const abortController = ac?.() ?? new AbortController();
  setTimeout(() => abortController.abort(), env.HARDWARE.TIMEOUTS.NODE);

  const res = await createClient(device).getBrowsers.query(
    parsedOpts.data as z.infer<TClientAPI["getBrowsers"]["args"]>,
    { signal: abortController.signal },
  );
  (controller.getState()[device.id] as NodeState).browsers.observed = res;
  return res;
};

const getLiveUpdate = async (device: Device) => {
  const current = controller.getState()[device.id];
  if (current.type !== "node") throw new Error("Invalid device type");
  return {
    type: "node" as const,
    status: current.status.observed ?? null,
    screenshots: current.screenshots ?? null,
    browsers: current.browsers?.observed ?? null,
    browserConfigs: current.browserConfigs?.observed ?? null,
  };
};

const getReconciliationState = async (device: Device) => {
  const current = controller.getState()[device.id];
  if (current.type !== "node") throw new Error("Invalid device type");
  return {
    observed: {
      type: "node" as const,
      status: current.status.observed ?? null,
      browsers:
        current.browsers.observed !== null
          ? Object.keys(current.browsers.observed).length > 0
          : null,
      browserConfigs: current.browserConfigs.observed ?? null,
    },
    target: {
      type: "node" as const,
      status: current.status.target ?? null,
      browsers: current.browsers.target ?? null,
      browserConfigs: current.browserConfigs.target ?? null,
    },
  };
};

const NodeService = {
  type: "node" as const,
  reboot,
  shutdown,
  start,
  getInfo,
  getStatus,
  execute,
  screenshot,
  openBrowsers,
  getBrowsers,
  closeBrowsers,
  reloadBrowser,
  reloadBrowsers,
  setBrowserConfig,
  getBrowserConfig,
  getLiveUpdate,
  getReconciliationState,
} satisfies TBridgeHardwareService & { type: "node" };

export type NodeService = typeof NodeService;
export default NodeService;
