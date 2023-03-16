import { wake } from "../utils/wol";
import { AppRouter } from "@ove/ove-client-router";
import { createTRPCProxyClient, httpLink } from "@trpc/client";
import fetch from "node-fetch";
import * as ws from "ws";
import {
  Device,
  NodeInfo,
  OVEException,
  Response,
  Options,
  Status,
  ID,
  Image,
  DeviceService, Optional
} from "@ove/ove-types";
import { z } from "zod";
import { Utils } from "@ove/ove-utils";

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

const reboot = async (device: Device, opts: Options): Promise<Optional<Status | OVEException>> => {
  const rebootOptsSchema = z.object({}).strict();
  const parsedOpts = rebootOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await createClient(device).reboot.mutate();
  return true;
};

const shutdown = async (device: Device, opts: Options): Promise<Optional<Status | OVEException>> => {
  const shutdownOptsSchema = z.object({}).strict();
  const parsedOpts = shutdownOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  await createClient(device).shutdown.mutate();
  return true;
};

const start = async (device: Device, opts: Options): Promise<Optional<Status | OVEException>> => {
  const startOptsSchema = z.object({}).strict();
  const parsedOpts = startOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  return await wake(device.mac, { address: device.ip });
};

const info = async (device: Device, opts: Options): Promise<Optional<NodeInfo | OVEException>> => {
  const infoOptsSchema = z.object({ type: z.string().optional() }).strict();
  const parsedOpts = infoOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getInfo.query(parsedOpts.data);
};

const status = async (device: Device, opts: Options): Promise<Optional<Response | OVEException>> => {
  const statusOptsSchema = z.object({}).strict();
  const parsedOpts = statusOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getStatus.query();
};

const execute = async (device: Device, opts: Options): Promise<Response | OVEException> => {
  const executeOptsSchema = z.object({ command: z.string() }).strict();
  const parsedOpts = executeOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  const response = await createClient(device).execute.mutate(parsedOpts.data);
  return { response };
};

const screenshot = async (device: Device, opts: Options): Promise<Image[] | OVEException> => {
  const screenshotOptsSchema = z.object({
    method: z.string(),
    screens: z.array(z.number())
  }).strict();
  const parsedOpts = screenshotOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  return await createClient(device).screenshot.mutate(parsedOpts.data);
};

const openBrowser = async (device: Device, opts: Options): Promise<ID | OVEException> => {
  const openBrowserOptsSchema = z.object({ displayId: z.number() }).strict();
  const parsedOpts = openBrowserOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  return await createClient(device).openBrowser.mutate(parsedOpts.data);
};

const getBrowserStatus = async (device: Device, opts: Options): Promise<Optional<Response | OVEException>> => {
  const getBrowserStatusOptsSchema = z.object({ id: z.number() }).strict();
  const parsedOpts = getBrowserStatusOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getBrowserStatus.query(parsedOpts.data);
};

const closeBrowser = async (device: Device, opts: Options): Promise<Status | OVEException> => {
  const closeBrowserOptsSchema = z.object({ id: z.number() }).strict();
  const parsedOpts = closeBrowserOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  return await createClient(device).closeBrowser.mutate(parsedOpts.data);
};

const closeBrowsers = async (device: Device, opts: Options): Promise<Status | OVEException> => {
  const closeBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = closeBrowsersOptsSchema.safeParse(opts);

  if (!parsedOpts.success) {
    return Utils.raise("Function options not recognised");
  }

  return await createClient(device).closeBrowsers.mutate();
};

const getBrowsers = async (device: Device, opts: Options): Promise<Optional<ID[] | OVEException>> => {
  const getBrowsersOptsSchema = z.object({}).strict();
  const parsedOpts = getBrowsersOptsSchema.safeParse(opts);

  if (!parsedOpts.success) return undefined;

  return await createClient(device).getBrowsers.query();
};

const NodeService: DeviceService<NodeInfo, undefined> = {
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


