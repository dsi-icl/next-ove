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
        url: `${device.protocol}://${device.ip}:${device.port}/api/v${env.CLIENT_API_VERSION}/trpc`,
        headers: () => {
          return {
            Authorization: fixedEncodeURIComponent(`Bearer ${env.PUBLIC_KEY}`)
          };
        }
      })
    ]
  });

const reboot = async (device: Device, args: TBridgeServiceArgs<"reboot">) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).reboot.mutate(
      parsedOpts.data as z.infer<TClientAPI["reboot"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const shutdown = async (
  device: Device,
  args: TBridgeServiceArgs<"shutdown">
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).shutdown.mutate(
      parsedOpts.data as z.infer<TClientAPI["shutdown"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const start = async (device: Device, args: TBridgeServiceArgs<"start">) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  try {
    return await wake(device.mac, env.NODE_TIMEOUT);
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getInfo = async (device: Device, args: TBridgeServiceArgs<"getInfo">) => {
  const infoOptsSchema = z.object({ type: z.string().optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).getInfo.query(
      parsedOpts.data as z.infer<TClientAPI["getInfo"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getStatus = async (
  device: Device,
  args: TBridgeServiceArgs<"getStatus">
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return statusOptions(() => createClient(device).getStatus.query(
      parsedOpts.data as z.infer<TClientAPI["getStatus"]["args"]>,
      { signal: ac.signal }
    ), device.ip);
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const execute = async (device: Device, args: TBridgeServiceArgs<"execute">) => {
  const executeOptsSchema = z.object({ command: z.string() }).strict();
  const parsedOpts = executeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).execute.mutate(
      parsedOpts.data as z.infer<TClientAPI["execute"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const screenshot = async (
  device: Device,
  args: TBridgeServiceArgs<"screenshot">
) => {
  const screenshotOptsSchema = z
    .strictObject({
      method: ScreenshotMethodSchema,
      screens: z.array(z.number())
    });
  const parsedOpts = screenshotOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).screenshot.mutate(
      parsedOpts.data as z.infer<TClientAPI["screenshot"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const openBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"openBrowsers">
) => {
  const openBrowserOptsSchema = z
    .strictObject({});
  const parsedOpts = openBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).openBrowsers.mutate(
      parsedOpts.data as z.infer<TClientAPI["openBrowsers"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const closeBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"closeBrowsers">
) => {
  const closeBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = closeBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).closeBrowsers.mutate(
      parsedOpts.data as z.infer<TClientAPI["closeBrowsers"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const reloadBrowser = async (
  device: Device,
  args: TBridgeServiceArgs<"reloadBrowser">
) => {
  const reloadBrowsersOptsSchema = z.strictObject({ browserId: z.number() });
  const parsedOpts = reloadBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).reloadBrowser.mutate(
      parsedOpts.data as z.infer<TClientAPI["reloadBrowser"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const reloadBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"reloadBrowsers">
) => {
  const reloadBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = reloadBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).reloadBrowsers.mutate(
      parsedOpts.data as z.infer<TClientAPI["reloadBrowsers"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const setWindowConfig = async (
  device: Device,
  args: TBridgeServiceArgs<"setWindowConfig">
) => {
  const setConfigOptsSchema = z.strictObject({
    config: z.record(z.string(), z.string())
  });
  const parsedOpts = setConfigOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).setWindowConfig.mutate(
      parsedOpts.data as z.infer<TClientAPI["setWindowConfig"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getWindowConfig = async (
  device: Device,
  args: TBridgeServiceArgs<"getWindowConfig">
) => {
  const configOptsSchema = z.object({});
  const parsedOpts = configOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).getWindowConfig.query(
      parsedOpts.data as z.infer<TClientAPI["getWindowConfig"]["args"]>,
      { signal: ac.signal }
    );
  } catch (e) {
    return raise(Json.stringify(e));
  }
};

const getBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"getBrowsers">
) => {
  const getBrowsersOptsSchema = z.strictObject({});
  const parsedOpts = getBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const ac = new AbortController();
  setTimeout(() => ac.abort(), env.NODE_TIMEOUT);

  try {
    return await createClient(device).getBrowsers.query(
      parsedOpts.data as z.infer<TClientAPI["getBrowsers"]["args"]>,
      { signal: ac.signal }
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
