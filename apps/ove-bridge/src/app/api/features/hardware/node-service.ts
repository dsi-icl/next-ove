/* global global, AbortController */

import { wake } from "../../utils/wol";
// IGNORE PATH - as importing only type, will not trigger full import on build
import { type AppRouter } from "../../../../../../ove-client/src/server/router";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import fetch from "node-fetch";
import * as ws from "ws";
import {
  type Device,
  type Browser,
  type TBridgeServiceArgs,
  type TBridgeHardwareService,
  ScreenshotMethodSchema
} from "@ove/ove-types";
import { z } from "zod";
import { env } from "../../../../env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;
globalAny.AbortController = AbortController;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

const fixedEncodeURIComponent = (str: string) => encodeURIComponent(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16));

export const createClient = (device: Device) =>
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
    transformer: undefined
  });

const reboot = async (device: Device, args: TBridgeServiceArgs<"reboot">) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).reboot.mutate(parsedOpts.data);
};

const shutdown = async (
  device: Device,
  args: TBridgeServiceArgs<"shutdown">
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await createClient(device).shutdown.mutate(parsedOpts.data);
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

  return await createClient(device).getInfo.query(parsedOpts.data);
};

const getStatus = async (
  device: Device,
  args: TBridgeServiceArgs<"getStatus">
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getStatus.query(parsedOpts.data);
};

const execute = async (device: Device, args: TBridgeServiceArgs<"execute">) => {
  const executeOptsSchema = z.object({ command: z.string() }).strict();
  const parsedOpts = executeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).execute.mutate(parsedOpts.data);
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

  return await createClient(device).screenshot.mutate(parsedOpts.data);
};

const openBrowser = async (
  device: Device,
  args: TBridgeServiceArgs<"openBrowser">
) => {
  const openBrowserOptsSchema = z.object({ displayId: z.number() }).strict();
  const parsedOpts = openBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).openBrowser.mutate(parsedOpts.data);
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

  return await createClient(device).getBrowser.query(parsedOpts.data);
};

const closeBrowser = async (
  device: Device,
  args: TBridgeServiceArgs<"closeBrowser">
) => {
  const closeBrowserOptsSchema = z.object({ browserId: z.number() }).strict();
  const parsedOpts = closeBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).closeBrowser.mutate(parsedOpts.data);
};

const closeBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"closeBrowsers">
) => {
  const closeBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = closeBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).closeBrowsers.mutate(parsedOpts.data);
};

const getBrowsers = async (
  device: Device,
  args: TBridgeServiceArgs<"getBrowsers">
) => {
  const getBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = getBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  const res = await createClient(device).getBrowsers.query(parsedOpts.data);
  return "oveError" in res ? res : res as Map<number, Browser>;
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
