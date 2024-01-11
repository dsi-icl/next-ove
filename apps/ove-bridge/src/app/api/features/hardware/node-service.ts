/* global global, AbortController */

import { wake } from "../../utils/wol";
// IGNORE PATH - as importing only type, will not trigger full import on build
// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { type AppRouter } from "../../../../../../ove-client/src/server/router";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import fetch from "node-fetch";
import * as ws from "ws";
import {
  type Device,
  ScreenshotMethodSchema,
  type TBridgeHardwareService,
  type TBridgeServiceArgs,
  TClientAPI
} from "@ove/ove-types";
import { z } from "zod";
import superjson from "superjson";
import { env } from "../../../../env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;
globalAny.AbortController = AbortController;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

const fixedEncodeURIComponent = (str: string) =>
  encodeURIComponent(str).replace(/[!'()*]/g, c =>
    "%" + c.charCodeAt(0).toString(16));

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
    ],
    transformer: superjson
  });

const reboot = async (device: Device, args: TBridgeServiceArgs<"reboot">) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).reboot
    .mutate(parsedOpts.data as z.infer<TClientAPI["reboot"]["args"]>);
};

const shutdown = async (
  device: Device,
  args: TBridgeServiceArgs<"shutdown">
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await createClient(device).shutdown
    .mutate(parsedOpts.data as z.infer<TClientAPI["shutdown"]["args"]>);
  return true;
};

const start = async (device: Device, args: TBridgeServiceArgs<"start">) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await wake(device.mac, { address: device.ip });
};

const getInfo = async (device: Device, args: TBridgeServiceArgs<"getInfo">) => {
  const infoOptsSchema = z.object({ type: z.string().optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getInfo
    .query(parsedOpts.data as z.infer<TClientAPI["getInfo"]["args"]>);
};

const getStatus = async (
  device: Device,
  args: TBridgeServiceArgs<"getStatus">
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getStatus
    .query(parsedOpts.data as z.infer<TClientAPI["getStatus"]["args"]>);
};

const execute = async (device: Device, args: TBridgeServiceArgs<"execute">) => {
  const executeOptsSchema = z.object({ command: z.string() }).strict();
  const parsedOpts = executeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).execute
    .mutate(parsedOpts.data as z.infer<TClientAPI["execute"]["args"]>);
};

const screenshot = async (
  device: Device,
  args: TBridgeServiceArgs<"screenshot">
) => {
  const screenshotOptsSchema = z
    .object({
      method: ScreenshotMethodSchema,
      screens: z.array(z.number())
    })
    .strict();
  const parsedOpts = screenshotOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).screenshot
    .mutate(parsedOpts.data as z.infer<TClientAPI["screenshot"]["args"]>);
};

const openBrowser = async (
  device: Device,
  args: TBridgeServiceArgs<"openBrowser">
) => {
  const openBrowserOptsSchema =
    z.object({ displayId: z.number(), url: z.string() }).strict();
  const parsedOpts = openBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).openBrowser
    .mutate(parsedOpts.data as z.infer<TClientAPI["openBrowser"]["args"]>);
};

const getBrowser = async (
  device: Device,
  args: TBridgeServiceArgs<"getBrowser">
) => {
  const getBrowserStatusOptsSchema = z
    .object({ browserId: z.number() })
    .strict();
  const parsedOpts = getBrowserStatusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getBrowser
    .query(parsedOpts.data as z.infer<TClientAPI["getBrowser"]["args"]>);
};

const closeBrowser = async (
  device: Device,
  args: TBridgeServiceArgs<"closeBrowser">
) => {
  const closeBrowserOptsSchema = z.object({ browserId: z.number() }).strict();
  const parsedOpts = closeBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).closeBrowser
    .mutate(parsedOpts.data as z.infer<TClientAPI["closeBrowser"]["args"]>);
};

const closeBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"closeBrowsers">
) => {
  const closeBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = closeBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).closeBrowsers
    .mutate(parsedOpts.data as z.infer<TClientAPI["closeBrowsers"]["args"]>);
};

const getBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"getBrowsers">
) => {
  const getBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = getBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getBrowsers
    .query(parsedOpts.data as z.infer<TClientAPI["getBrowsers"]["args"]>);
};

const NodeService: TBridgeHardwareService = {
  reboot,
  shutdown,
  start,
  getInfo,
  getStatus,
  execute,
  screenshot,
  openBrowser,
  closeBrowser,
  getBrowser,
  getBrowsers,
  closeBrowsers
};

export default NodeService;
