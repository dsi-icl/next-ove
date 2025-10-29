/* global AbortController, setTimeout */

import {
  type Device,
  ScreenshotMethodSchema,
  type TBridgeHardwareService,
  type TBridgeServiceArgs,
  type TClientAPI,
  BrowserConfigSchema,
} from "@ove/ove-types";
import { z } from "zod";
import { env } from "../../env";
import { execSync } from "child_process";
import { statusOptions } from "../../utils/status";
import { createTRPCClient, httpLink } from "@trpc/client";
import { Json, raise, buildDeviceURL } from "@ove/ove-utils";
// IGNORE PATH - as importing only type, will not trigger full import on build
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from "../../../../ove-client/src/server/router";

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

  try {
    return createClient(device).reboot.mutate(
      parsedOpts.data as z.infer<TClientAPI["reboot"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
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

  try {
    return createClient(device).shutdown.mutate(
      parsedOpts.data as z.infer<TClientAPI["shutdown"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const start = async (
  device: Device,
  _args: TBridgeServiceArgs<"start">,
  _ac?: () => AbortController,
) => {
  try {
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
  } catch (e) {
    return raise(Json.stringify(e));
  }
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

  try {
    return createClient(device).getInfo.query(
      parsedOpts.data as z.infer<TClientAPI["getInfo"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
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
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  try {
    return statusOptions(
      () =>
        createClient(device).getStatus.query(
          parsedOpts.data as z.infer<TClientAPI["getStatus"]["args"]>,
          { signal: controller.signal },
        ),
      device,
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
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

  try {
    return createClient(device).execute.mutate(
      parsedOpts.data as z.infer<TClientAPI["execute"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
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

  try {
    return createClient(device).screenshot.mutate(
      parsedOpts.data as z.infer<TClientAPI["screenshot"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
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

  try {
    return createClient(device).openBrowsers.mutate(
      parsedOpts.data as z.infer<TClientAPI["openBrowsers"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
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

  try {
    return createClient(device).closeBrowsers.mutate(
      parsedOpts.data as z.infer<TClientAPI["closeBrowsers"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
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

  try {
    return createClient(device).reloadBrowser.mutate(
      parsedOpts.data as z.infer<TClientAPI["reloadBrowser"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
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

  try {
    return createClient(device).reloadBrowsers.mutate(
      parsedOpts.data as z.infer<TClientAPI["reloadBrowsers"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
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

  try {
    return createClient(device).setBrowserConfig.mutate(
      parsedOpts.data as z.infer<TClientAPI["setBrowserConfig"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getBrowserConfig = async (
  device: Device,
  args: TBridgeServiceArgs<"getBrowserConfig">,
  ac?: () => AbortController,
) => {
  const configOptsSchema = z.object({});
  const parsedOpts = configOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  try {
    return createClient(device).getBrowserConfig.query(
      parsedOpts.data as z.infer<TClientAPI["getBrowserConfig"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"getBrowsers">,
  ac?: () => AbortController,
) => {
  const getBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = getBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.HARDWARE.TIMEOUTS.NODE);

  try {
    return createClient(device).getBrowsers.query(
      parsedOpts.data as z.infer<TClientAPI["getBrowsers"]["args"]>,
      { signal: controller.signal },
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const NodeService: TBridgeHardwareService = {
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
};

export default NodeService;
