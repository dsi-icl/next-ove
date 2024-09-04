/* global AbortController, global, setTimeout */

import {
  type Device,
  ScreenshotMethodSchema,
  type TBridgeHardwareService,
  type TBridgeServiceArgs,
  type TClientAPI
} from "@ove/ove-types";
import { z } from "zod";
import * as ws from "ws";
import fetch from "node-fetch";
import { env } from "../../../../env";
import { wake } from "../../utils/wol";
import { statusOptions } from "../../utils/status";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
// IGNORE PATH - as importing only type, will not trigger full import on build
// eslint-disable-next-line @nx/enforce-module-boundaries
import type { AppRouter } from "../../../../../../ove-client/src/server/router";
import { Json, raise } from "@ove/ove-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;
globalAny.AbortController = AbortController;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

const fixedEncodeURIComponent = (str: string) =>
  encodeURIComponent(str).replace(
    /[!'()*]/g,
    c => "%" + c.charCodeAt(0).toString(16)
  );

export const createClient = (
  device: Device
): ReturnType<typeof createTRPCProxyClient<AppRouter>> =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `${device.protocol}://${device.ip}:${device.port}/api/v${env.CLIENT_VERSION}/trpc`,
        headers: () => {
          return {
            Authorization: fixedEncodeURIComponent(`Bearer ${env.PUBLIC_KEY}`)
          };
        }
      })
    ]
  });

const reboot = async (device: Device, args: TBridgeServiceArgs<"reboot">, ac?: () => AbortController) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).reboot.mutate(
      parsedOpts.data as z.infer<TClientAPI["reboot"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const shutdown = async (
  device: Device,
  args: TBridgeServiceArgs<"shutdown">,
  ac?: () => AbortController
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).shutdown.mutate(
      parsedOpts.data as z.infer<TClientAPI["shutdown"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const start = async (device: Device, args: TBridgeServiceArgs<"start">, ac?: () => AbortController) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();

  try {
    return wake(device.mac, env.NODE_TIMEOUT, undefined, controller);
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getInfo = async (device: Device, args: TBridgeServiceArgs<"getInfo">, ac?: () => AbortController) => {
  const infoOptsSchema = z.object({ type: z.string().optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).getInfo.query(
      parsedOpts.data as z.infer<TClientAPI["getInfo"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getStatus = async (
  device: Device,
  args: TBridgeServiceArgs<"getStatus">,
  ac?: () => AbortController
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return statusOptions(() => createClient(device).getStatus.query(
      parsedOpts.data as z.infer<TClientAPI["getStatus"]["args"]>,
      { signal: controller.signal }
    ), device.ip);
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const execute = async (device: Device, args: TBridgeServiceArgs<"execute">, ac?: () => AbortController) => {
  const executeOptsSchema = z.object({ command: z.string() }).strict();
  const parsedOpts = executeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).execute.mutate(
      parsedOpts.data as z.infer<TClientAPI["execute"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const screenshot = async (
  device: Device,
  args: TBridgeServiceArgs<"screenshot">,
  ac?: () => AbortController
) => {
  const screenshotOptsSchema = z
    .strictObject({
      method: ScreenshotMethodSchema,
      screens: z.array(z.number())
    });
  const parsedOpts = screenshotOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).screenshot.mutate(
      parsedOpts.data as z.infer<TClientAPI["screenshot"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const openBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"openBrowsers">,
  ac?: () => AbortController
) => {
  const openBrowserOptsSchema = z
    .strictObject({});
  const parsedOpts = openBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).openBrowsers.mutate(
      parsedOpts.data as z.infer<TClientAPI["openBrowsers"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const closeBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"closeBrowsers">,
  ac?: () => AbortController
) => {
  const closeBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = closeBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).closeBrowsers.mutate(
      parsedOpts.data as z.infer<TClientAPI["closeBrowsers"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const reloadBrowser = async (
  device: Device,
  args: TBridgeServiceArgs<"reloadBrowser">,
  ac?: () => AbortController
) => {
  const reloadBrowsersOptsSchema = z.strictObject({ browserId: z.number() });
  const parsedOpts = reloadBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).reloadBrowser.mutate(
      parsedOpts.data as z.infer<TClientAPI["reloadBrowser"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const reloadBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"reloadBrowsers">,
  ac?: () => AbortController
) => {
  const reloadBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = reloadBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).reloadBrowsers.mutate(
      parsedOpts.data as z.infer<TClientAPI["reloadBrowsers"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const setWindowConfig = async (
  device: Device,
  args: TBridgeServiceArgs<"setWindowConfig">,
  ac?: () => AbortController
) => {
  const setConfigOptsSchema = z.strictObject({
    config: z.record(z.string(), z.string())
  });
  const parsedOpts = setConfigOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).setWindowConfig.mutate(
      parsedOpts.data as z.infer<TClientAPI["setWindowConfig"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getWindowConfig = async (
  device: Device,
  args: TBridgeServiceArgs<"getWindowConfig">,
  ac?: () => AbortController
) => {
  const configOptsSchema = z.object({});
  const parsedOpts = configOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).getWindowConfig.query(
      parsedOpts.data as z.infer<TClientAPI["getWindowConfig"]["args"]>,
      { signal: controller.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"getBrowsers">,
  ac?: () => AbortController
) => {
  const getBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = getBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const controller = ac?.() ?? new AbortController();
  setTimeout(() => controller.abort(), env.NODE_TIMEOUT);

  try {
    return createClient(device).getBrowsers.query(
      parsedOpts.data as z.infer<TClientAPI["getBrowsers"]["args"]>,
      { signal: controller.signal }
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
  setWindowConfig,
  getWindowConfig
};

export default NodeService;
