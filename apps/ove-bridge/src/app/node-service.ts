import { wake } from "../utils/wol";
import { AppRouter } from "@ove/ove-client-router";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import fetch from "node-fetch";
import * as ws from "ws";
import {
  Device,
  DS,
  DSArgs,
  MDCInfo,
  NodeInfo,
  Optional,
  OVEException, ScreenshotMethodSchema,
  Status
} from "@ove/ove-types";
import { z } from "zod";

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

const reboot = async (device: Device, args: DSArgs<"reboot", DS<NodeInfo>>): Promise<Optional<Status | OVEException>> => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).reboot.mutate(parsedOpts);
};

const shutdown = async (device: Device, args: DSArgs<"shutdown", DS<NodeInfo>>) => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  await createClient(device).shutdown.mutate(parsedOpts);
  return true;
};

const start = async (device: Device, args: DSArgs<"start", DS<MDCInfo>>) => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await wake(device.mac, { address: device.ip });
};

const getInfo = async (device: Device, args: DSArgs<"getInfo", DS<NodeInfo>>) => {
  const infoOptsSchema = z.object({ type: z.string().optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getInfo.query(parsedOpts.data);
};

const getStatus = async (device: Device, args: DSArgs<"getStatus", DS<NodeInfo>>) => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getStatus.query(parsedOpts);
};

const execute = async (device: Device, args: DSArgs<"execute", DS<NodeInfo>>) => {
  const executeOptsSchema = z.object({ command: z.string() }).strict();
  const parsedOpts = executeOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).execute.mutate(parsedOpts.data);
};

const screenshot = async (device: Device, args: DSArgs<"screenshot", DS<NodeInfo>>) => {
  const screenshotOptsSchema = z.object({
    method: ScreenshotMethodSchema,
    screens: z.array(z.number())
  }).strict();
  const parsedOpts = screenshotOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).screenshot.mutate(parsedOpts.data);
};

const openBrowser = async (device: Device, args: DSArgs<"openBrowser", DS<NodeInfo>>) => {
  const openBrowserOptsSchema = z.object({ displayId: z.number() }).strict();
  const parsedOpts = openBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).openBrowser.mutate(parsedOpts.data);
};

const getBrowserStatus = async (device: Device, args: DSArgs<"getBrowserStatus", DS<NodeInfo>>) => {
  const getBrowserStatusOptsSchema = z.object({ browserId: z.number() }).strict();
  const parsedOpts = getBrowserStatusOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getBrowserStatus.query(parsedOpts.data);
};

const closeBrowser = async (device: Device, args: DSArgs<"closeBrowser", DS<NodeInfo>>) => {
  const closeBrowserOptsSchema = z.object({ browserId: z.number() }).strict();
  const parsedOpts = closeBrowserOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).closeBrowser.mutate(parsedOpts.data);
};

const closeBrowsers = async (device: Device, args: DSArgs<"closeBrowsers", DS<NodeInfo>>) => {
  const closeBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = closeBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).closeBrowsers.mutate(parsedOpts);
};

const getBrowsers = async (device: Device, args: DSArgs<"getBrowsers", DS<NodeInfo>>) => {
  const getBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = getBrowsersOptsSchema.safeParse(args);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getBrowsers.query(parsedOpts);
};

const NodeService: DS<NodeInfo> = {
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


