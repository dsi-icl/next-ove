/* global global, AbortController */

import { wake } from "../../utils/wol";
import { AppRouter } from "@ove/ove-client-router";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import fetch from "node-fetch";
import * as ws from "ws";
import {
  Device,
  DeviceService,
  DeviceServiceArgs,
  ScreenshotMethodSchema
} from "@ove/ove-types";
import { z } from "zod";
import { readAsset } from "@ove/file-utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalAny = global as any;
globalAny.AbortController = AbortController;
globalAny.fetch = fetch;
globalAny.WebSocket = ws;

const fixedEncodeURIComponent = (str: string) => encodeURIComponent(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16));

const createClient = (device: Device) =>
  createTRPCProxyClient<AppRouter>({
    links: [
      httpLink({
        url: `http://${device.ip}:${device.port}/api/v1/trpc`,
        headers: () => {
          return {
            Authorization: fixedEncodeURIComponent(`Bearer ${readAsset("public_key")}`)
          };
        }
      })
    ],
    transformer: undefined
  });

const reboot = async (device: Device, args: DeviceServiceArgs<"reboot">) => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).reboot.mutate(parsedOpts.data);
};

const shutdown = async (
  device: Device,
  args: DeviceServiceArgs<"shutdown">
) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await createClient(device).shutdown.mutate(parsedOpts.data);
  return true;
};

const start = async (device: Device, args: DeviceServiceArgs<"start">) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await wake(device.mac, { address: device.ip });
};

const getInfo = async (device: Device, args: DeviceServiceArgs<"getInfo">) => {
  const infoOptsSchema = z.object({ type: z.string().optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getInfo.query(parsedOpts.data);
};

const getStatus = async (
  device: Device,
  args: DeviceServiceArgs<"getStatus">
) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getStatus.query(parsedOpts.data);
};

const execute = async (device: Device, args: DeviceServiceArgs<"execute">) => {
  const executeOptsSchema = z.object({ command: z.string() }).strict();
  const parsedOpts = executeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).execute.mutate(parsedOpts.data);
};

const screenshot = async (
  device: Device,
  args: DeviceServiceArgs<"screenshot">
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
  args: DeviceServiceArgs<"openBrowser">
) => {
  const openBrowserOptsSchema = z.object({ displayId: z.number() }).strict();
  const parsedOpts = openBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).openBrowser.mutate(parsedOpts.data);
};

const getBrowserStatus = async (
  device: Device,
  args: DeviceServiceArgs<"getBrowserStatus">
) => {
  const getBrowserStatusOptsSchema = z
    .object({ browserId: z.number() })
    .strict();
  const parsedOpts = getBrowserStatusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getBrowserStatus.query(parsedOpts.data);
};

const closeBrowser = async (
  device: Device,
  args: DeviceServiceArgs<"closeBrowser">
) => {
  const closeBrowserOptsSchema = z.object({ browserId: z.number() }).strict();
  const parsedOpts = closeBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).closeBrowser.mutate(parsedOpts.data);
};

const closeBrowsers = async (
  device: Device,
  args: DeviceServiceArgs<"closeBrowsers">
) => {
  const closeBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = closeBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).closeBrowsers.mutate(parsedOpts.data);
};

const getBrowsers = async (
  device: Device,
  args: DeviceServiceArgs<"getBrowsers">
) => {
  const getBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = getBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getBrowsers.query(parsedOpts.data);
};

const NodeService: DeviceService = {
  reboot,
  shutdown,
  start,
  getInfo,
  getStatus,
  execute,
  screenshot,
  openBrowser,
  getBrowserStatus,
  closeBrowser,
  getBrowsers,
  closeBrowsers
};

export default NodeService;
