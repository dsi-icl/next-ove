import { z } from "zod";
import { OVEException, OVEExceptionSchema, ResponseSchema } from "./ove-types";
import { MDCSourceSchema } from "@ove/mdc-control";

// Type aliases for API
export type Image = string;
export const ImageSchema = z.string();

export type ID = number;
export const IDSchema = z.number();

export const DeviceIDSchema = z.string();
export type Status = boolean;
export const StatusSchema = z.boolean();

export type Optional<T> = T | undefined;

// Node types
export const ScreenshotMethodSchema = z.union([z.literal("upload"), z.literal("local"), z.literal("response")]);
export type ScreenshotMethod = z.infer<typeof ScreenshotMethodSchema>;

// PJLink types
export const PJLinkSourceSchema = z.object({
  RGB: z.literal(1),
  VIDEO: z.literal(2),
  DIGITAL: z.literal(3),
  STORAGE: z.literal(4),
  NETWORK: z.literal(5)
}).strict();

export type PJLinkSource = z.infer<typeof PJLinkSourceSchema>;

// Services
export const ServiceTypesSchema = z.union([z.literal("node"), z.literal("mdc"), z.literal("pjlink")]);
export type ServiceTypes = z.infer<typeof ServiceTypesSchema>;
export const SourceSchemas = z.union([MDCSourceSchema.keyof(), PJLinkSourceSchema.keyof()]);

// Device
export const DeviceSchema = z.object({
  id: z.string(),
  description: z.string(),
  ip: z.string(),
  port: z.number(),
  protocol: ServiceTypesSchema,
  mac: z.string(),
  tags: z.array(z.string())
});

export type Device = z.infer<typeof DeviceSchema>;

// Bridge types
export const BridgeMetadataSchema = z.object({ bridge: z.string() });
export type BridgeMetadata = z.infer<typeof BridgeMetadataSchema>;
export type BridgeResponse<Response> = {
  meta: BridgeMetadata
  response: Response
};
export const getBridgeResponseSchema = <T extends z.ZodTypeAny>(schema: T) => z.object({
  meta: BridgeMetadataSchema,
  response: schema
});

export type DeviceResponse<Type> = Type | OVEException;
export type MultiDeviceResponse<Type> =
  { deviceId: string, response: DeviceResponse<Type> }[]
  | OVEException;

export const getDeviceResponseSchema = <T extends z.ZodTypeAny>(schema: T): z.ZodUnion<readonly [T, typeof OVEExceptionSchema]> => z.union([schema, OVEExceptionSchema]);

const multiDeviceWrapper = <T extends z.ZodTypeAny>(schema: T) => z.array(z.object({
  deviceId: z.string(),
  response: getDeviceResponseSchema(schema)
}));
export const getMultiDeviceResponseSchema = <T extends z.ZodTypeAny>(schema: T): z.ZodUnion<readonly [ReturnType<typeof multiDeviceWrapper<T>>, typeof OVEExceptionSchema]> => z.union([multiDeviceWrapper(schema), OVEExceptionSchema]);

type ServiceAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  args: z.ZodObject<A, "strict", z.ZodTypeAny>
  returns: U
};

type ClientAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  client: ReturnType<typeof getDeviceResponseSchema<U>>;
} & { [Key in keyof ServiceAPIRoute<A, U>]: ServiceAPIRoute<A, U>[Key] }

type BridgeAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  bridge: ReturnType<typeof getBridgeResponseSchema<ClientAPIRoute<A, U>["client"]>>;
} & { [Key in keyof ClientAPIRoute<A, U>]: ClientAPIRoute<A, U>[Key] };

type BridgeAPIRouteAll<A extends z.ZodRawShape, U extends z.ZodTypeAny> =
  { [Key in keyof ClientAPIRoute<A, U>]: ClientAPIRoute<A, U>[Key] } & {
  bridge: ReturnType<typeof getBridgeResponseSchema<ReturnType<typeof getMultiDeviceResponseSchema<U>>>>
};

type CoreAPIRoute<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  [Key in keyof BridgeAPIRoute<A, U>]: BridgeAPIRoute<A, U>[Key]
};

type CoreAPIRouteAll<A extends z.ZodRawShape, U extends z.ZodTypeAny> = {
  [Key in keyof BridgeAPIRouteAll<A, U>]: BridgeAPIRouteAll<A, U>[Key]
};

const emptySchema = z.object({}).strict();
const infoArgsSchema = { type: z.string().optional() };

const ServiceAPI = {
  getStatus: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  getInfo: {
    args: z.object(infoArgsSchema).strict(),
    returns: z.unknown()
  },
  getBrowserStatus: {
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema
  },
  getBrowsers: {
    args: z.object({}).strict(),
    returns: z.array(IDSchema)
  },
  start: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  reboot: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  shutdown: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  execute: {
    args: z.object({ command: z.string() }).strict(),
    returns: ResponseSchema
  },
  screenshot: {
    args: z.object({
      method: ScreenshotMethodSchema,
      screens: z.array(IDSchema)
    }).strict(),
    returns: z.array(ImageSchema)
  },
  openBrowser: {
    args: z.object({
      displayId: IDSchema.optional()
    }).strict(),
    returns: IDSchema
  },
  closeBrowser: {
    args: z.object({ browserId: IDSchema }).strict(),
    returns: StatusSchema
  },
  closeBrowsers: {
    args: z.object({}).strict(),
    returns: StatusSchema
  },
  setVolume: {
    args: z.object({ volume: z.number() }).strict(),
    returns: StatusSchema
  },
  setSource: {
    args: z.object({
      source: SourceSchemas,
      channel: z.number().optional()
    }).strict(),
    returns: StatusSchema
  },
  mute: { args: z.object({}).strict(), returns: StatusSchema },
  unmute: { args: z.object({}).strict(), returns: StatusSchema },
  muteAudio: { args: z.object({}).strict(), returns: StatusSchema },
  unmuteAudio: { args: z.object({}).strict(), returns: StatusSchema },
  muteVideo: { args: z.object({}).strict(), returns: StatusSchema },
  unmuteVideo: { args: z.object({}).strict(), returns: StatusSchema }
};

const mapToClient = <A extends z.ZodRawShape, U extends z.ZodTypeAny>(route: ServiceAPIRoute<A, U>): ClientAPIRoute<A, U> => {
  return {
    ...route,
    client: getDeviceResponseSchema(route.returns)
  };
};

const mapToBridge = <A extends z.ZodRawShape, U extends z.ZodTypeAny>(route: ClientAPIRoute<A, U>) => {
  return {
    ...route,
    args: route.args.extend({
      deviceId: DeviceIDSchema
    }),
    bridge: getBridgeResponseSchema(route["client"])
  };
};

const mapToBridgeAll = <A extends z.ZodRawShape, U extends z.ZodTypeAny>(route: ClientAPIRoute<A, U>) => {
  return {
    ...route,
    args: route.args.extend({ tag: z.string().optional() }),
    bridge: getBridgeResponseSchema(getMultiDeviceResponseSchema(route["returns"]))
  };
};

const mapToCore = <A extends z.ZodRawShape, U extends z.ZodTypeAny, T extends BridgeAPIRoute<A, U> | BridgeAPIRouteAll<A, U>>(route: T) => {
  return {
    ...route,
    args: route.args.extend({ bridgeId: z.string() })
  };
};

type ServiceAPIType = typeof ServiceAPI;
type ServiceKeys = keyof ServiceAPIType;

type ClientAPIRoutesType = {
  [Key in ServiceKeys]: ClientAPIRoute<ServiceAPIType[Key]["args"]["shape"], typeof ServiceAPI[Key]["returns"]>
};

type ClientKeys = ServiceKeys;

const devicesSchema = z.array(DeviceSchema);
const deviceIDSchema = z.object({ deviceId: DeviceIDSchema }).strict();
const addDeviceSchema = z.object({ device: DeviceSchema }).strict();

type BridgeAPIRoutesType = {
  getDevice: BridgeAPIRoute<typeof deviceIDSchema["shape"], typeof DeviceSchema>
  getDevices: BridgeAPIRoute<typeof emptySchema["shape"], typeof devicesSchema>
  addDevice: BridgeAPIRoute<typeof addDeviceSchema["shape"], typeof StatusSchema>
  removeDevice: BridgeAPIRoute<typeof deviceIDSchema["shape"], typeof StatusSchema>
} & {
  [Key in ClientKeys]: BridgeAPIRoute<z.extendShape<ClientAPIRoutesType[Key]["args"]["shape"], { deviceId: z.ZodString }>, ClientAPIRoutesType[Key]["returns"]>
} & {
  [Key in ClientKeys as `${Key}All`]: BridgeAPIRouteAll<z.extendShape<ClientAPIRoutesType[Key]["args"]["shape"], { tag: z.ZodOptional<z.ZodString> }>, ClientAPIRoutesType[Key]["returns"]>
};

export const ClientAPIRoutes: ClientAPIRoutesType = {
  getStatus: mapToClient(ServiceAPI["getStatus"]),
  getInfo: mapToClient(ServiceAPI["getInfo"]),
  getBrowserStatus: mapToClient(ServiceAPI["getBrowserStatus"]),
  getBrowsers: mapToClient(ServiceAPI["getBrowsers"]),
  start: mapToClient(ServiceAPI["start"]),
  reboot: mapToClient(ServiceAPI["reboot"]),
  shutdown: mapToClient(ServiceAPI["shutdown"]),
  execute: mapToClient(ServiceAPI["execute"]),
  screenshot: mapToClient(ServiceAPI["screenshot"]),
  openBrowser: mapToClient(ServiceAPI["openBrowser"]),
  closeBrowser: mapToClient(ServiceAPI["closeBrowser"]),
  closeBrowsers: mapToClient(ServiceAPI["closeBrowsers"]),
  setVolume: mapToClient(ServiceAPI["setVolume"]),
  setSource: mapToClient(ServiceAPI["setSource"]),
  mute: mapToClient(ServiceAPI["mute"]),
  unmute: mapToClient(ServiceAPI["unmute"]),
  muteAudio: mapToClient(ServiceAPI["muteAudio"]),
  unmuteAudio: mapToClient(ServiceAPI["unmuteAudio"]),
  muteVideo: mapToClient(ServiceAPI["muteVideo"]),
  unmuteVideo: mapToClient(ServiceAPI["unmuteVideo"])
};

export const BridgeAPIRoutes: BridgeAPIRoutesType = {
  getStatus: mapToBridge(ClientAPIRoutes["getStatus"]),
  getStatusAll: mapToBridgeAll(ClientAPIRoutes["getStatus"]),
  getInfo: mapToBridge(ClientAPIRoutes["getInfo"]),
  getInfoAll: mapToBridgeAll(ClientAPIRoutes["getInfo"]),
  getBrowserStatus: mapToBridge(ClientAPIRoutes["getBrowserStatus"]),
  getBrowserStatusAll: mapToBridgeAll(ClientAPIRoutes["getBrowserStatus"]),
  getBrowsers: mapToBridge(ClientAPIRoutes["getBrowsers"]),
  getBrowsersAll: mapToBridgeAll(ClientAPIRoutes["getBrowsers"]),
  start: mapToBridge(ClientAPIRoutes["start"]),
  startAll: mapToBridgeAll(ClientAPIRoutes["start"]),
  reboot: mapToBridge(ClientAPIRoutes["reboot"]),
  rebootAll: mapToBridgeAll(ClientAPIRoutes["reboot"]),
  shutdown: mapToBridge(ClientAPIRoutes["shutdown"]),
  shutdownAll: mapToBridgeAll(ClientAPIRoutes["shutdown"]),
  execute: mapToBridge(ClientAPIRoutes["execute"]),
  executeAll: mapToBridgeAll(ClientAPIRoutes["execute"]),
  screenshot: mapToBridge(ClientAPIRoutes["screenshot"]),
  screenshotAll: mapToBridgeAll(ClientAPIRoutes["screenshot"]),
  openBrowser: mapToBridge(ClientAPIRoutes["openBrowser"]),
  openBrowserAll: mapToBridgeAll(ClientAPIRoutes["openBrowser"]),
  closeBrowser: mapToBridge(ClientAPIRoutes["closeBrowser"]),
  closeBrowserAll: mapToBridgeAll(ClientAPIRoutes["closeBrowser"]),
  closeBrowsers: mapToBridge(ClientAPIRoutes["closeBrowsers"]),
  closeBrowsersAll: mapToBridgeAll(ClientAPIRoutes["closeBrowsers"]),
  setVolume: mapToBridge(ClientAPIRoutes["setVolume"]),
  setVolumeAll: mapToBridgeAll(ClientAPIRoutes["setVolume"]),
  setSource: mapToBridge(ClientAPIRoutes["setSource"]),
  setSourceAll: mapToBridgeAll(ClientAPIRoutes["setSource"]),
  mute: mapToBridge(ClientAPIRoutes["mute"]),
  muteAll: mapToBridgeAll(ClientAPIRoutes["mute"]),
  unmute: mapToBridge(ClientAPIRoutes["unmute"]),
  unmuteAll: mapToBridgeAll(ClientAPIRoutes["unmute"]),
  muteAudio: mapToBridge(ClientAPIRoutes["muteAudio"]),
  muteAudioAll: mapToBridgeAll(ClientAPIRoutes["muteAudio"]),
  unmuteAudio: mapToBridge(ClientAPIRoutes["unmuteAudio"]),
  unmuteAudioAll: mapToBridgeAll(ClientAPIRoutes["unmuteAudio"]),
  muteVideo: mapToBridge(ClientAPIRoutes["muteVideo"]),
  muteVideoAll: mapToBridgeAll(ClientAPIRoutes["muteVideo"]),
  unmuteVideo: mapToBridge(ClientAPIRoutes["unmuteVideo"]),
  unmuteVideoAll: mapToBridgeAll(ClientAPIRoutes["unmuteVideo"]),
  getDevice: {
    args: z.object({ deviceId: DeviceIDSchema }).strict(),
    returns: DeviceSchema,
    client: getDeviceResponseSchema(DeviceSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(DeviceSchema))
  },
  getDevices: {
    args: z.object({}).strict(),
    returns: z.array(DeviceSchema),
    client: getDeviceResponseSchema(z.array(DeviceSchema)),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(z.array(DeviceSchema)))
  },
  addDevice: {
    args: z.object({ device: DeviceSchema }).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  },
  removeDevice: {
    args: z.object({deviceId: DeviceIDSchema}).strict(),
    returns: StatusSchema,
    client: getDeviceResponseSchema(StatusSchema),
    bridge: getBridgeResponseSchema(getDeviceResponseSchema(StatusSchema))
  }
};

//@ts-ignore
export const CoreAPIRoutes: CoreAPIRoutesType = {
  getStatus: mapToCore(BridgeAPIRoutes["getStatus"]),
  getStatusAll: mapToCore(BridgeAPIRoutes["getStatusAll"]),
  getInfo: mapToCore(BridgeAPIRoutes["getInfo"]),
  getInfoAll: mapToCore(BridgeAPIRoutes["getInfoAll"]),
  getBrowserStatus: mapToCore(BridgeAPIRoutes["getBrowserStatus"]),
  getBrowserStatusAll: mapToCore(BridgeAPIRoutes["getBrowserStatusAll"]),
  getBrowsers: mapToCore(BridgeAPIRoutes["getBrowsers"]),
  getBrowsersAll: mapToCore(BridgeAPIRoutes["getBrowsersAll"]),
  start: mapToCore(BridgeAPIRoutes["start"]),
  startAll: mapToCore(BridgeAPIRoutes["startAll"]),
  reboot: mapToCore(BridgeAPIRoutes["reboot"]),
  rebootAll: mapToCore(BridgeAPIRoutes["rebootAll"]),
  shutdown: mapToCore(BridgeAPIRoutes["shutdown"]),
  shutdownAll: mapToCore(BridgeAPIRoutes["shutdownAll"]),
  execute: mapToCore(BridgeAPIRoutes["execute"]),
  executeAll: mapToCore(BridgeAPIRoutes["executeAll"]),
  screenshot: mapToCore(BridgeAPIRoutes["screenshot"]),
  screenshotAll: mapToCore(BridgeAPIRoutes["screenshotAll"]),
  openBrowser: mapToCore(BridgeAPIRoutes["openBrowser"]),
  openBrowserAll: mapToCore(BridgeAPIRoutes["openBrowserAll"]),
  closeBrowser: mapToCore(BridgeAPIRoutes["closeBrowser"]),
  closeBrowserAll: mapToCore(BridgeAPIRoutes["closeBrowserAll"]),
  closeBrowsers: mapToCore(BridgeAPIRoutes["closeBrowsers"]),
  closeBrowsersAll: mapToCore(BridgeAPIRoutes["closeBrowsersAll"]),
  setVolume: mapToCore(BridgeAPIRoutes["setVolume"]),
  setVolumeAll: mapToCore(BridgeAPIRoutes["setVolumeAll"]),
  setSource: mapToCore(BridgeAPIRoutes["setSource"]),
  setSourceAll: mapToCore(BridgeAPIRoutes["setSourceAll"]),
  mute: mapToCore(BridgeAPIRoutes["mute"]),
  muteAll: mapToCore(BridgeAPIRoutes["muteAll"]),
  unmute: mapToCore(BridgeAPIRoutes["unmute"]),
  unmuteAll: mapToCore(BridgeAPIRoutes["unmuteAll"]),
  muteAudio: mapToCore(BridgeAPIRoutes["muteAudio"]),
  muteAudioAll: mapToCore(BridgeAPIRoutes["muteAudioAll"]),
  unmuteAudio: mapToCore(BridgeAPIRoutes["unmuteAudio"]),
  unmuteAudioAll: mapToCore(BridgeAPIRoutes["unmuteAudioAll"]),
  muteVideo: mapToCore(BridgeAPIRoutes["muteVideo"]),
  muteVideoAll: mapToCore(BridgeAPIRoutes["muteVideoAll"]),
  unmuteVideo: mapToCore(BridgeAPIRoutes["unmuteVideo"]),
  unmuteVideoAll: mapToCore(BridgeAPIRoutes["unmuteVideoAll"]),
  getDevice: mapToCore(BridgeAPIRoutes["getDevice"]),
  getDevices: mapToCore(BridgeAPIRoutes["getDevices"]),
  addDevice: mapToCore(BridgeAPIRoutes["addDevice"]),
  removeDevice: mapToCore(BridgeAPIRoutes["removeDevice"])
};

// type CoreAPIRoutesTypeDynamic<A extends z.ZodRawShape, T extends BridgeAPIRoute<A, U> | BridgeAPIRouteAll<A, U>, U extends z.ZodTypeAny> = T extends BridgeAPIRoute<A, U> ? BridgeAPIRoute<z.extendShape<T["args"]["shape"], {bridgeId: z.ZodString}>, T["returns"> : BridgeAPIRouteAll<>

type CoreAPIRoutesType = {
  [Key in keyof BridgeAPIRoutesType]: BridgeAPIRoutesType[Key] extends BridgeAPIRoute<BridgeAPIRoutesType[Key]["args"]["shape"], BridgeAPIRoutesType[Key]["returns"]> ? CoreAPIRoute<z.extendShape<BridgeAPIRoutesType[Key]["args"]["shape"], { bridgeId: z.ZodString }>, BridgeAPIRoutesType[Key]["returns"]> : CoreAPIRouteAll<z.extendShape<BridgeAPIRoutesType[Key]["args"]["shape"], { bridgeId: z.ZodString }>, BridgeAPIRoutesType[Key]["returns"]>
}

type GetObjectOutput<Key extends keyof BridgeAPIRoutesType> = BridgeAPIRoutesType[Key]["args"] extends z.ZodObject<BridgeAPIRoutesType[Key]["args"]["shape"], "strict", z.ZodTypeAny, infer O> ? O : any

export type BridgeAPI = {
  [Key in keyof BridgeAPIRoutesType]: (args: GetObjectOutput<Key>, callback: APICallback<z.infer<BridgeAPIRoutesType[Key]["bridge"]>>) => void
};

type APICallback<T> = (response: T) => void;

export type DS = {
  [Key in keyof ClientAPIRoutesType]?: (device: Device, args: z.infer<ClientAPIRoutesType[Key]["args"]>) => Promise<Optional<z.infer<ClientAPIRoutesType[Key]["client"]>>>
}

export type DSArgs<Key extends keyof DS> = Parameters<NonNullable<DS[Key]>>[1];

export type ClientToServerEvents = {};

export type Browser = {
  controller: AbortController
  client?: object
};